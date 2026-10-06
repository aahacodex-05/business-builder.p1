"use client";

import Link from "next/link";
import { formatPrice, type MenuItem } from "@/data/menu";
import { useCart } from "@/lib/cart";

export function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();

  return (
    <li className="item">
      <h3>
        <Link className="item__link" href={`/menu/${item.id}`}>
          {item.name}
        </Link>
      </h3>
      <p>{item.description}</p>
      <div className="item__foot">
        <span className="price">{formatPrice(item.price)}</span>
        <button className="add" onClick={() => add(item.id)} aria-label={`Add ${item.name}`}>
          +
        </button>
      </div>
    </li>
  );
}
