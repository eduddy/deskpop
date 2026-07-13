"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readCart, clearCart, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { IS_STATIC } from "@/lib/asset";

type CatalogEntry = { slug: string; name: string; priceCents: number };

export default function CheckoutForm({ catalog }: { catalog: CatalogEntry[] }) {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLines(readCart());
  }, []);

  if (lines === null) return <div className="empty-note">Preparing manifest…</div>;

  const rows = lines
    .map((l) => {
      const product = catalog.find((c) => c.slug === l.slug);
      return product ? { ...product, qty: l.qty } : null;
    })
    .filter((r): r is CatalogEntry & { qty: number } => Boolean(r));

  if (rows.length === 0) {
    return (
      <div className="empty-note">
        <p style={{ marginBottom: 18 }}>Nothing to check out — your cart is empty.</p>
        <Link href="/catalog" className="btn btn-primary">
          Browse the catalog
        </Link>
      </div>
    );
  }

  const totalCents = rows.reduce((sum, r) => sum + r.priceCents * r.qty, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Static hosting (e.g. GitHub Pages) has no API route. Re-price from the
    // catalog client-side and confirm the demo order without a server.
    if (IS_STATIC) {
      const totalNow = rows.reduce((sum, r) => sum + r.priceCents * r.qty, 0);
      const rand = Array.from({ length: 4 }, () =>
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
      ).join("");
      const orderId = `OT-${Date.now().toString(36).toUpperCase()}-${rand}`;
      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(orderId)}&total=${totalNow}`);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          items: rows.map((r) => ({ slug: r.slug, qty: r.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Checkout failed. Try again.");
        setSubmitting(false);
        return;
      }
      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url; // hand off to Stripe Checkout
        return;
      }
      clearCart();
      router.push(
        `/checkout/success?order=${encodeURIComponent(data.orderId)}&total=${data.totalCents}`
      );
    } catch {
      setError("Network error — checkout did not complete.");
      setSubmitting(false);
    }
  }

  return (
    <div className="detail-grid" style={{ paddingTop: 0 }}>
      <div className="panel">
        <h3 style={{ marginBottom: 16 }}>Order summary</h3>
        <table className="cart-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Qty</th>
              <th>Line total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td>{r.name}</td>
                <td className="mono">{r.qty}</td>
                <td className="price">{formatPrice(r.priceCents * r.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="price" style={{ fontSize: "1.3rem", marginTop: 16 }} data-testid="checkout-total">
          Total: {formatPrice(totalCents)}
        </p>
      </div>

      <form className="panel form-grid" onSubmit={submit} data-testid="checkout-form">
        <h3>Contact</h3>
        <label>
          Full name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Reyes"
            data-testid="checkout-name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ada@example.com"
            data-testid="checkout-email"
          />
        </label>
        {error && (
          <p className="form-error" role="alert" data-testid="checkout-error">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting} data-testid="place-order">
          {submitting ? "Processing…" : "Place order"}
        </button>
        <Link href="/cart" className="section-link">
          ← Back to cart
        </Link>
      </form>
    </div>
  );
}
