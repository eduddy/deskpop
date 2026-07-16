"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

export default function AddToCartButton({ slug }: { slug: string }) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className="btn btn-primary"
      data-testid="add-to-cart"
      onClick={() => {
        addToCart(slug);
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
