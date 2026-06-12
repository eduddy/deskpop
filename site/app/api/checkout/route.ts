// Checkout endpoint. With STRIPE_SECRET_KEY set, creates a real Stripe
// Checkout Session via the REST API and returns its redirect URL. Without it
// (current configuration: Stripe intentionally skipped), validates the cart
// against the catalog, records the order, and completes in demo mode.

import { NextResponse } from "next/server";
import { getProduct, createOrder } from "@/lib/db";

export const dynamic = "force-dynamic";

type CartLine = { slug: string; qty: number };

export async function POST(req: Request) {
  let payload: { email?: string; name?: string; items?: CartLine[] };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const email = (payload.email ?? "").trim();
  const name = (payload.name ?? "").trim();
  const lines = (payload.items ?? []).filter((l) => l && l.slug && l.qty > 0);

  if (!email.includes("@") || !name) {
    return NextResponse.json(
      { ok: false, error: "A name and a valid email are required." },
      { status: 400 }
    );
  }
  if (lines.length === 0) {
    return NextResponse.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
  }

  // Re-price every line from the catalog; never trust client prices.
  const items = [];
  for (const line of lines) {
    const product = await getProduct(line.slug);
    if (!product) {
      return NextResponse.json(
        { ok: false, error: `Unknown product: ${line.slug}` },
        { status: 400 }
      );
    }
    items.push({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      qty: Math.min(line.qty, 99),
    });
  }
  const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);

  if (process.env.STRIPE_SECRET_KEY) {
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("customer_email", email);
    form.set("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", `${origin}/cart`);
    items.forEach((item, i) => {
      form.set(`line_items[${i}][quantity]`, String(item.qty));
      form.set(`line_items[${i}][price_data][currency]`, "usd");
      form.set(`line_items[${i}][price_data][unit_amount]`, String(item.priceCents));
      form.set(`line_items[${i}][price_data][product_data][name]`, item.name);
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const session = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: session?.error?.message ?? "Stripe rejected the session." },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, mode: "stripe", url: session.url });
  }

  // Demo mode: record the order (persists only when Neon is connected).
  const orderId = `OT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
  try {
    await createOrder({ id: orderId, email, name, items, totalCents });
  } catch {
    // Order persistence is best-effort in demo mode.
  }
  return NextResponse.json({ ok: true, mode: "demo", orderId, totalCents });
}
