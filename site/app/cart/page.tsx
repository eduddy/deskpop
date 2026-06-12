import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import CartView from "@/components/CartView";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const products = await getProducts();
  return (
    <div className="wrap">
      <div className="page-head">
        <span className="kicker">Manifest</span>
        <h1>Your cart</h1>
      </div>
      <div className="section" style={{ paddingTop: 28 }}>
        <CartView
          catalog={products.map((p) => ({
            slug: p.slug,
            name: p.name,
            priceCents: p.priceCents,
            image: p.image,
          }))}
        />
      </div>
    </div>
  );
}
