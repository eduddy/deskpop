"use client";

// localStorage-backed cart shared across client components via a custom event.

export type CartLine = { slug: string; qty: number };

const KEY = "opentalon-cart";
export const CART_EVENT = "opentalon-cart-changed";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l?.slug && l?.qty > 0) : [];
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(slug: string, qty = 1) {
  const lines = readCart();
  const existing = lines.find((l) => l.slug === slug);
  if (existing) existing.qty = Math.min(existing.qty + qty, 99);
  else lines.push({ slug, qty });
  writeCart(lines);
}

export function setQty(slug: string, qty: number) {
  let lines = readCart();
  if (qty <= 0) lines = lines.filter((l) => l.slug !== slug);
  else lines = lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(qty, 99) } : l));
  writeCart(lines);
}

export function clearCart() {
  writeCart([]);
}

export function cartCount(): number {
  return readCart().reduce((n, l) => n + l.qty, 0);
}
