import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts, formatPrice } from "@/lib/db";

export const metadata: Metadata = {
  title: "Catalog",
  description: "OpenTalon audits, agent deployments, field kits, and dossiers.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  const products = category
    ? allProducts.filter((p) => p.category === category)
    : allProducts;
  const active = categories.find((c) => c.slug === category);

  return (
    <div className="wrap">
      <div className="page-head">
        <span className="kicker">Catalog</span>
        <h1>{active ? active.name : "Everything we sell"}</h1>
        <p className="lede">
          {active
            ? active.blurb
            : "Fixed-scope audits, bounded agent deployments, field hardware, and written doctrine. Every line item has a price, a deliverable, and an end date — that's the whole business model."}
        </p>
      </div>

      <div className="section" style={{ paddingTop: 32 }}>
        <div className="filter-row" data-testid="category-filter">
          <Link href="/catalog" className={!category ? "active" : ""}>
            All ({allProducts.length})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog?category=${c.slug}`}
              className={category === c.slug ? "active" : ""}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="empty-note">
            <p>No products in this category yet.</p>
          </div>
        ) : (
          <div className="card-grid" data-testid="product-grid">
            {products.map((p) => (
              <Link key={p.slug} href={`/catalog/${p.slug}`} className="card" data-testid="product-card">
                <span className="accent-bar" style={{ background: p.accent }} />
                <img className="card-img" src={p.image} alt={`${p.name} product image`} />
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
        )}
      </div>
    </div>
  );
}
