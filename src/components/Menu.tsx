"use client";

import { useState } from "react";
import { CATEGORIES, MENU, formatPrice, type Category } from "@/data/menu";
import { useCart } from "@/lib/cart";

export function Menu() {
  const [category, setCategory] = useState<Category>("popular");
  const { add } = useCart();

  return (
    <>
      <div className="tabs" role="tablist">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={id === category}
            className={`tab ${id === category ? "is-active" : ""}`}
            onClick={() => setCategory(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="menu">
        {MENU.filter((item) => item.category === category).map((item) => (
          <li key={item.id} className="item">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="item__foot">
              <span className="price">{formatPrice(item.price)}</span>
              <button className="add" onClick={() => add(item.id)} aria-label={`Add ${item.name}`}>
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
