import type { Metadata } from "next";
import { getProducts, hasDatabase } from "@/lib/db";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const products = await getProducts();
  const stripeLive = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="wrap">
      <div className="page-head">
        <span className="kicker">Final approach</span>
        <h1>Checkout</h1>
        {!stripeLive && (
          <p className="lede">
            Payments are running in <strong>demo mode</strong> — no card is
            required and no charge is made. Orders are
            {hasDatabase() ? " recorded to the database." : " confirmed without persistence."}
            {" "}Connecting Stripe keys switches this flow to live Stripe Checkout
            automatically.
          </p>
        )}
      </div>
      <div className="section" style={{ paddingTop: 28 }}>
        <CheckoutForm
          catalog={products.map((p) => ({
            slug: p.slug,
            name: p.name,
            priceCents: p.priceCents,
          }))}
        />
      </div>
    </div>
  );
}
