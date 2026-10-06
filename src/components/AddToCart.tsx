"use client";

import { formatPrice, type MenuItem } from "@/data/menu";
import { useCart } from "@/lib/cart";

export function AddToCart({ item }: { item: MenuItem }) {
  const { add } = useCart();

  return (
    <button className="btn" onClick={() => add(item.id)}>
      Add to order · {formatPrice(item.price)}
    </button>
  );
}
