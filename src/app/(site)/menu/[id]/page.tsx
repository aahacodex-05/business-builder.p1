import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { ItemArt } from "@/components/ItemArt";
import { MenuCard } from "@/components/MenuCard";
import { MENU, categoryLabel, findItem, formatPrice } from "@/data/menu";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return MENU.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = findItem((await params).id);
  return item
    ? {
        title: `${item.name} | Mocha Express Coffee`,
        description: item.description ?? `${item.name}, ${formatPrice(item.price)}. Order ahead for pickup in Portland.`,
      }
    : {};
}

export default async function ItemPage({ params }: Props) {
  const item = findItem((await params).id);
  if (!item) notFound();

  const related = MENU.filter((other) => other.category === item.category && other.id !== item.id).slice(0, 3);

  return (
    <main className="container item-page">
      <Link className="back" href={`/menu#${item.category}`}>
        ← Back to the menu
      </Link>
      <div className="item-page__grid">
        <ItemArt kind={item.kind} />
        <div>
          <p className="eyebrow">{categoryLabel(item.category)}</p>
          <h1>{item.name}</h1>
          <p className="item-page__price">{formatPrice(item.price)}</p>
          {item.description && <p className="lead">{item.description}</p>}
          <AddToCart item={item} />
          <p className="item-page__note">Order ahead and pick it up at any of our three Portland-area shops.</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2>You might also like</h2>
          <ul className="menu">
            {related.map((other) => (
              <MenuCard key={other.id} item={other} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
