// End-to-end QA sweep. Run: node tests/qa.mjs [BASE_URL]
// Covers nav integrity, landing hero, projects, catalog filtering, product
// detail, cart math, checkout flow, blog filtering, 404, and image loading.

import { chromium } from "playwright";

const BASE = (process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3100").replace(/\/$/, "");
let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// Route the browser through the agent proxy for non-local targets (the CA is
// trusted via NODE_EXTRA_CA_CERTS); direct connections get reset otherwise.
const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy;
const useProxy = proxyServer && !/localhost|127\.0\.0\.1/.test(BASE);
const browser = await chromium.launch(useProxy ? { proxy: { server: proxyServer } } : {});
const page = await browser.newPage({
  viewport: { width: 1366, height: 900 },
  ignoreHTTPSErrors: true,
});

const badResponses = [];
page.on("response", (r) => {
  if (r.status() >= 400 && r.url().startsWith(BASE)) badResponses.push(`${r.status()} ${r.url()}`);
});
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));

console.log(`\nQA target: ${BASE}\n`);

// ---- Landing page ----
console.log("Landing page");
await page.goto(BASE, { waitUntil: "networkidle" });
check("h1 hero copy present", (await page.locator("h1").first().textContent())?.includes("spec sheet"));
const hero = page.locator('img[src*="hero"]');
check("hero image rendered", (await hero.count()) === 1 && (await hero.evaluate((el) => el.naturalWidth > 0)));
check("primary CTA visible", await page.locator('a.btn-primary:has-text("Browse the catalog")').isVisible());
check("3 project cards on landing", (await page.locator('a.card:has(.chip:has-text("Agentic project"))').count()) === 3);
check("3 featured products on landing", (await page.locator('a.card:has(.price)').count()) === 3);

// ---- Nav links all lead to real pages ----
console.log("Navigation");
for (const [label, path, h1] of [
  ["Projects", "/projects", "Projects"],
  ["Catalog", "/catalog", "Everything we sell"],
  ["Blog", "/blog", "Blog, news & guides"],
  ["About", "/about", "About OpenTalon"],
  ["Cart", "/cart", "Your cart"],
]) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.click(`.nav-links a:has-text("${label}")`);
  await page.waitForURL((u) => u.pathname.replace(/\/$/, "").endsWith(path), { timeout: 10000 });
  // Wait for the hydrated heading (client-filtered pages first render a
  // Suspense fallback heading, then swap in the real one).
  await page
    .waitForFunction(
      (want) => document.querySelector("h1")?.textContent?.toLowerCase().includes(want),
      h1.toLowerCase(),
      { timeout: 10000 }
    )
    .catch(() => {});
  const heading = await page.locator("h1").first().textContent();
  check(`nav "${label}" → ${path}`, page.url().includes(path) && (heading ?? "").toLowerCase().includes(h1.toLowerCase()), `url=${page.url()} h1=${heading}`);
}

// ---- Projects ----
console.log("Projects");
await page.goto(`${BASE}/projects`, { waitUntil: "domcontentloaded" });
check("3 project rows listed", (await page.locator(".post-row").count()) === 3);
await page.goto(`${BASE}/projects/wayfinder-7`, { waitUntil: "domcontentloaded" });
check("project h1", (await page.locator("h1").textContent())?.includes("WAYFINDER-7"));
check("project metadata table ≥6 rows", (await page.locator(".spec-table tr").count()) >= 6);
check("project story ≥4 paragraphs", (await page.locator(".story p").count()) >= 4);
for (const slug of ["cindertrace", "night-market-ledger"]) {
  const res = await page.goto(`${BASE}/projects/${slug}`, { waitUntil: "domcontentloaded" });
  check(`project page /projects/${slug}`, res.status() === 200 && (await page.locator(".story p").count()) >= 4);
}

// ---- Catalog + filtering ----
// Filtering runs client-side, so wait until the card count settles to the
// expected value (up to 5s) rather than reading immediately after load.
async function settledCount(selector, expected) {
  await page
    .waitForFunction(
      ([sel, exp]) => document.querySelectorAll(sel).length === exp,
      [selector, expected],
      { timeout: 5000 }
    )
    .catch(() => {});
  return page.locator(selector).count();
}
console.log("Catalog");
await page.goto(`${BASE}/catalog`, { waitUntil: "domcontentloaded" });
check("10 products in full catalog", (await settledCount('[data-testid="product-card"]', 10)) === 10);
const filters = [
  ["edge-audits", 3],
  ["agent-deployments", 3],
  ["field-kits", 2],
  ["dossiers", 2],
];
for (const [cat, expected] of filters) {
  await page.goto(`${BASE}/catalog?category=${cat}`, { waitUntil: "domcontentloaded" });
  const n = await settledCount('[data-testid="product-card"]', expected);
  check(`filter ${cat} → ${expected} products`, n === expected, `got ${n}`);
  check(`filter ${cat} active state`, (await page.locator(`.filter-row a.active[href*="${cat}"]`).count()) === 1);
}

// ---- Product images distinct + loaded ----
await page.goto(`${BASE}/catalog`, { waitUntil: "networkidle" });
const imgSrcs = await page.locator('[data-testid="product-card"] img').evaluateAll((els) =>
  els.map((el) => ({ src: el.getAttribute("src"), ok: el.naturalWidth > 0 }))
);
check("all 10 product images load", imgSrcs.every((i) => i.ok));
check("all product images distinct files", new Set(imgSrcs.map((i) => i.src)).size === imgSrcs.length);

// ---- Product detail + cart flow ----
// The add-to-cart button is a client island; on a static host it isn't
// interactive until hydration, so click and then wait for the badge to reach
// the expected count, retrying the click if the first one landed too early.
async function addToCartUntil(expected) {
  for (let attempt = 0; attempt < 8; attempt++) {
    await page.click('[data-testid="add-to-cart"]');
    try {
      await page.waitForFunction(
        (want) => document.querySelector('[data-testid="cart-count"]')?.textContent === `(${want})`,
        expected,
        { timeout: 1200 }
      );
      return true;
    } catch {
      /* click likely fired pre-hydration; retry */
    }
  }
  return false;
}
console.log("Cart & checkout flow");
await page.goto(`${BASE}/catalog/talon-recon-audit`, { waitUntil: "domcontentloaded" });
check("product name", (await page.locator('[data-testid="product-name"]').textContent())?.includes("Talon Recon Audit"));
check("product price $1,800", (await page.locator('[data-testid="product-price"]').textContent())?.includes("1,800"));
check("cart badge = 1", await addToCartUntil(1));
check("cart badge = 2 after second add", await addToCartUntil(2));

await page.goto(`${BASE}/catalog/edge-crate-mk2`, { waitUntil: "domcontentloaded" });
await addToCartUntil(3);

await page.goto(`${BASE}/cart`, { waitUntil: "domcontentloaded" });
await page.waitForSelector('[data-testid="cart-table"]');
check("2 cart rows", (await page.locator('[data-testid="cart-row"]').count()) === 2);
let total = await page.locator('[data-testid="cart-total"]').textContent();
check("cart total $4,540 (2×1800 + 940)", total?.includes("4,540"), total ?? "");
// qty decrement
await page.click('button[aria-label="Decrease Talon Recon Audit quantity"]');
await page.waitForTimeout(250);
total = await page.locator('[data-testid="cart-total"]').textContent();
check("total $2,740 after decrement", total?.includes("2,740"), total ?? "");

await page.click('[data-testid="to-checkout"]');
await page.waitForSelector('[data-testid="checkout-form"]');
check("checkout total matches cart", (await page.locator('[data-testid="checkout-total"]').textContent())?.includes("2,740"));
await page.fill('[data-testid="checkout-name"]', "QA Talon");
await page.fill('[data-testid="checkout-email"]', "qa@opentalon.test");
await page.click('[data-testid="place-order"]');
await page.waitForSelector('[data-testid="order-confirmed"]', { timeout: 15000 });
check("order confirmed page", page.url().includes("/checkout/success"));
check("order id shown", /OT-[A-Z0-9]+-[A-Z0-9]+/.test(await page.locator(".lede").first().textContent() ?? ""));
check("cart cleared after order", (await page.locator('[data-testid="cart-count"]').textContent()) === "(0)");

// ---- Blog ----
console.log("Blog");
await page.goto(`${BASE}/blog`, { waitUntil: "domcontentloaded" });
check("7 posts listed", (await settledCount('[data-testid="post-list"] .post-row', 7)) === 7);
for (const [kind, expected] of [["news", 2], ["article", 2], ["guide", 3]]) {
  await page.goto(`${BASE}/blog?kind=${kind}`, { waitUntil: "domcontentloaded" });
  const n = await settledCount('[data-testid="post-list"] .post-row', expected);
  check(`blog filter ${kind} → ${expected}`, n === expected, `got ${n}`);
}
await page.goto(`${BASE}/blog/hardening-agents-for-vacuum-grade-ops`, { waitUntil: "domcontentloaded" });
check("guide post renders ≥5 paragraphs", (await page.locator(".article > p").count()) >= 5);

// ---- Empty-cart checkout guard ----
await page.goto(`${BASE}/checkout`, { waitUntil: "domcontentloaded" });
check("empty checkout shows empty state", (await page.locator(".empty-note").count()) === 1);

// ---- 404 ----
const res404 = await page.goto(`${BASE}/nowhere-real`, { waitUntil: "domcontentloaded" });
check("404 status for unknown route", res404.status() === 404);
check("custom 404 page", (await page.locator("h1").textContent())?.includes("404"));

// ---- Mobile spot check ----
console.log("Responsive & hygiene");
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
await mobile.goto(BASE, { waitUntil: "networkidle" });
check("mobile: no horizontal overflow", await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
check("mobile: nav cart link visible", await mobile.locator(".nav-links a.cart-link").isVisible());
await mobile.screenshot({ path: "/tmp/qa-mobile-home.png", fullPage: false });
await mobile.close();

await page.setViewportSize({ width: 1366, height: 900 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/qa-home.png", fullPage: true });
await page.goto(`${BASE}/catalog`, { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/qa-catalog.png", fullPage: true });
await page.goto(`${BASE}/projects/night-market-ledger`, { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/qa-project.png", fullPage: true });

check("no failed same-origin requests", badResponses.filter((b) => !b.includes("/nowhere-real")).length === 0, badResponses.join("; "));
check("no page JS errors", consoleErrors.length === 0, consoleErrors.join("; "));

await browser.close();

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("FAILURES:\n - " + failures.join("\n - "));
  process.exit(1);
}
