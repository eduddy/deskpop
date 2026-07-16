import Link from "next/link";
import { getProjects, getProducts, getPosts, formatPrice, getCategories } from "@/lib/db";
import { asset } from "@/lib/asset";

export default async function Home() {
  const [projects, products, posts, categories] = await Promise.all([
    getProjects(),
    getProducts(),
    getPosts(),
    getCategories(),
  ]);
  const featured = ["talon-recon-audit", "wayfinder-deployment", "edge-crate-mk2"]
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const latest = posts.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="kicker">Small-task edge consultants</span>
            <h1>
              The spec sheet ends.
              <br />
              <span className="accent">We start there.</span>
            </h1>
            <p className="lede">
              OpenTalon deploys small, fixed-scope consulting strikes and
              bounded autonomous agents to the edge of your operation — the
              place where documentation diverges from reality. Forty-eight
              hours, one sharp question, every action ledgered. For teams who
              adapt and excel.
            </p>
            <div className="hero-actions">
              <Link href="/catalog" className="btn btn-primary">
                Browse the catalog
              </Link>
              <Link href="/projects" className="btn btn-ghost">
                Read mission logs
              </Link>
            </div>
          </div>
          <div className="hero-img-frame">
            <span className="frame-tag">FIG. 01 — INTEGRATION BAY 4</span>
            <img
              src={asset("/images/hero.png")}
              alt="OpenTalon consultant working at an aerospace integration bay, blueprint schematics and orange flight-suit accents"
              width={1536}
              height={1024}
            />
          </div>
        </div>
        <div className="ticker" aria-hidden>
          ADAPT // EXCEL <span>◆</span> 48-HOUR AUDITS <span>◆</span> BOUNDED
          AUTONOMY <span>◆</span> EVERY ACTION LEDGERED <span>◆</span> NO
          RETAINERS <span>◆</span> LAUNCH WINDOWS HELD: 31/31 <span>◆</span>
          ADAPT // EXCEL <span>◆</span> SAFE MODE IS A FEATURE
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">Mission logs</span>
              <h2>Three agents. Three edges held.</h2>
            </div>
            <Link href="/projects" className="section-link">
              All projects →
            </Link>
          </div>
          <div className="card-grid">
            {projects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="card">
                <span className="accent-bar" style={{ background: p.accent }} />
                <img className="card-img card-img-wide" src={asset(p.image)} alt={`${p.name} project artwork`} />
                <div className="card-body">
                  <span className="chip chip-fill">Agentic project</span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="card-meta">
                    <span className="mono" style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>
                      {p.metadata[0]?.value}
                    </span>
                    <span className="section-link">Read log →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg-raised)", borderTop: "2px solid var(--ink)", borderBottom: "2px solid var(--ink)" }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">Catalog</span>
              <h2>Buy exactly the help you need</h2>
            </div>
            <Link href="/catalog" className="section-link">
              Full catalog →
            </Link>
          </div>
          <div className="card-grid">
            {featured.map((p) => (
              <Link key={p.slug} href={`/catalog/${p.slug}`} className="card">
                <span className="accent-bar" style={{ background: p.accent }} />
                <img className="card-img" src={asset(p.image)} alt={`${p.name} product image`} />
                <div className="card-body">
                  <span className="chip">
                    {categories.find((c) => c.slug === p.category)?.name ?? p.category}
                  </span>
                  <h3>{p.name}</h3>
                  <p>{p.tagline}</p>
                  <div className="card-meta">
                    <span className="price">{formatPrice(p.priceCents)}</span>
                    <span className="section-link">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">Dispatches</span>
              <h2>News, doctrine, and field guides</h2>
            </div>
            <Link href="/blog" className="section-link">
              All dispatches →
            </Link>
          </div>
          <div className="post-list">
            {latest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="post-row">
                <span className="chip chip-fill">{post.kind}</span>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <span className="post-date">{post.date}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap panel" style={{ display: "grid", gap: 16, justifyItems: "start" }}>
          <span className="kicker">Brand doctrine</span>
          <h2>We don&apos;t do retainers. We do results in small units.</h2>
          <p className="lede">
            Aerospace taught us that systems fail at the seams, and cyberpunk
            taught us who survives when they do: the small crew that adapts
            faster than the org chart. Every OpenTalon engagement is scoped to
            a single sharp question, every agent we ship has its authority
            written down, and every decision — human or machine — lands in a
            ledger you can replay.
          </p>
          <Link href="/about" className="btn btn-dark">
            About OpenTalon
          </Link>
        </div>
      </section>
    </>
  );
}
