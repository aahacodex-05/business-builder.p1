"use client";

import { useState } from "react";
import { CATEGORIES, MENU, type Category } from "@/data/menu";
import { MenuCard } from "./MenuCard";

export function Menu() {
  const [category, setCategory] = useState<Category>("popular");

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
          <MenuCard key={item.id} item={item} />
        ))}
      </ul>
    </>
  );
}
