import type { Metadata } from "next";
import { MenuCard } from "@/components/MenuCard";
import { MenuNav } from "@/components/MenuNav";
import { CATEGORIES, MENU, POPULAR } from "@/data/menu";

export const metadata: Metadata = {
  title: "Menu | Mocha Express Coffee",
  description:
    "Mochas, lattes, frappes, bubble tea, smoothies, shakes and breakfast. Order ahead for pickup at any of our three Portland-area shops.",
};

const SECTIONS = [
  { id: "popular", label: "Popular", items: POPULAR },
  ...CATEGORIES.map(({ id, label }) => ({ id, label, items: MENU.filter((item) => item.category === id) })),
];

export default function MenuPage() {
  return (
    <main className="menu-page">
      <div className="container section__head">
        <p className="eyebrow">The menu</p>
        <h1>Order ahead, then grab a seat.</h1>
      </div>
      <MenuNav sections={SECTIONS.map(({ id, label }) => ({ id, label }))} />
      <div className="container">
        {SECTIONS.map(({ id, label, items }) => (
          <section key={id} id={id} className="menu-page__section">
            <h2>{label}</h2>
            <ul className="menu">
              {items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
