"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart, setQty, CART_EVENT, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { asset } from "@/lib/asset";

type CatalogEntry = { slug: string; name: string; priceCents: number; image: string };

export default function CartView({ catalog }: { catalog: CatalogEntry[] }) {
  const [lines, setLines] = useState<CartLine[] | null>(null);

  useEffect(() => {
    const update = () => setLines(readCart());
    update();
    window.addEventListener(CART_EVENT, update);
    return () => window.removeEventListener(CART_EVENT, update);
  }, []);

  if (lines === null) {
    return <div className="empty-note">Loading manifest…</div>;
  }

  const rows = lines
    .map((l) => {
      const product = catalog.find((c) => c.slug === l.slug);
      return product ? { ...product, qty: l.qty } : null;
    })
    .filter((r): r is CatalogEntry & { qty: number } => Boolean(r));

  if (rows.length === 0) {
    return (
      <div className="empty-note" data-testid="empty-cart">
        <p style={{ marginBottom: 18 }}>Your manifest is empty.</p>
        <Link href="/catalog" className="btn btn-primary">
          Browse the catalog
        </Link>
      </div>
    );
  }

  const totalCents = rows.reduce((sum, r) => sum + r.priceCents * r.qty, 0);

  return (
    <div style={{ display: "grid", gap: 26 }}>
      <table className="cart-table" data-testid="cart-table">
        <thead>
          <tr>
            <th>Unit</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Line total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} data-testid="cart-row">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img src={asset(r.image)} alt="" width={52} height={52} style={{ border: "1.5px solid var(--ink)" }} />
                  <Link href={`/catalog/${r.slug}`} style={{ fontWeight: 600 }}>
                    {r.name}
                  </Link>
                </div>
              </td>
              <td className="price">{formatPrice(r.priceCents)}</td>
              <td>
                <span className="qty-controls">
                  <button type="button" aria-label={`Decrease ${r.name} quantity`} onClick={() => setQty(r.slug, r.qty - 1)}>
                    −
                  </button>
                  <span>{r.qty}</span>
                  <button type="button" aria-label={`Increase ${r.name} quantity`} onClick={() => setQty(r.slug, r.qty + 1)}>
                    +
                  </button>
                </span>
              </td>
              <td className="price">{formatPrice(r.priceCents * r.qty)}</td>
              <td>
                <button type="button" className="remove-btn" onClick={() => setQty(r.slug, 0)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <span className="price" style={{ fontSize: "1.4rem" }} data-testid="cart-total">
          Total: {formatPrice(totalCents)}
        </span>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/catalog" className="btn btn-ghost">
            Keep browsing
          </Link>
          <Link href="/checkout" className="btn btn-primary" data-testid="to-checkout">
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
