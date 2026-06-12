"use client";

import { useEffect, useState } from "react";
import { cartCount, CART_EVENT } from "@/lib/cart";

export default function CartBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setCount(cartCount());
    update();
    window.addEventListener(CART_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return <span data-testid="cart-count">({count ?? 0})</span>;
}
