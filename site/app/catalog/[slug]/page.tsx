import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getCategories, formatPrice } from "@/lib/db";
import AddToCartButton from "@/components/AddToCartButton";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product ? product.name : "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProduct(slug), getCategories()]);
  if (!product) notFound();
  const category = categories.find((c) => c.slug === product.category);
  const related = (await getProducts({ category: product.category })).filter(
    (p) => p.slug !== product.slug
  );

  return (
    <div className="wrap">
      <div className="detail-grid">
        <div className="hero-img-frame" style={{ borderColor: product.accent }}>
          <span className="frame-tag" style={{ background: product.accent }}>
            {product.specs.find((s) => s.label === "SKU")?.value ?? "OT-UNIT"}
          </span>
          <img src={product.image} alt={`${product.name} product image`} />
        </div>
        <div className="detail-copy">
          {category && (
            <Link href={`/catalog?category=${category.slug}`} className="chip">
              {category.name}
            </Link>
          )}
          <h1 style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)" }} data-testid="product-name">
            {product.name}
          </h1>
          <p className="lede">{product.tagline}</p>
          <p style={{ color: "var(--ink-soft)" }}>{product.description}</p>
          <table className="spec-table">
            <tbody>
              {product.specs.map((s) => (
                <tr key={s.label}>
                  <td className="spec-label">{s.label}</td>
                  <td>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginTop: 6 }}>
            <span className="price" style={{ fontSize: "1.6rem" }} data-testid="product-price">
              {formatPrice(product.priceCents)}
            </span>
            <AddToCartButton slug={product.slug} />
            <Link href="/cart" className="btn btn-ghost">
              Go to cart
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="section" style={{ paddingTop: 8 }}>
          <div className="section-head">
            <div>
              <span className="kicker">Same bay</span>
              <h2>Related units</h2>
            </div>
          </div>
          <div className="card-grid">
            {related.map((p) => (
              <Link key={p.slug} href={`/catalog/${p.slug}`} className="card">
                <span className="accent-bar" style={{ background: p.accent }} />
                <img className="card-img" src={p.image} alt={`${p.name} product image`} />
                <div className="card-body">
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
      )}
    </div>
  );
}
