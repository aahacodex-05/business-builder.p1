export type Category = "popular" | "mochas" | "food";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  /** Price in cents. */
  price: number;
  category: Category;
};

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "mochas", label: "Mochas" },
  { id: "food", label: "Food" },
];

// TODO: replace placeholder items and prices with the full menu.
export const MENU: MenuItem[] = [
  { id: "chai-latte", name: "Chai Latte", description: "Spiced black tea, steamed milk.", price: 450, category: "popular" },
  { id: "signature-mocha", name: "Signature Mocha", description: "Espresso, house chocolate, whipped cream.", price: 525, category: "popular" },
  { id: "cold-brew", name: "Cold Brew", description: "Slow-steeped, smooth and bold.", price: 425, category: "popular" },
  { id: "classic-mocha", name: "Classic Mocha", description: "Rich chocolate meets double espresso.", price: 500, category: "mochas" },
  { id: "white-mocha", name: "White Chocolate Mocha", description: "Sweet, creamy, a little indulgent.", price: 525, category: "mochas" },
  { id: "peppermint-mocha", name: "Peppermint Mocha", description: "Cool mint, warm chocolate.", price: 550, category: "mochas" },
  { id: "egg-cheese-bagel", name: "Egg & Cheese Bagel", description: "Toasted bagel, egg, melted cheese.", price: 650, category: "food" },
  { id: "breakfast-burrito", name: "Breakfast Burrito", description: "Eggs, potatoes, cheese, salsa.", price: 850, category: "food" },
  { id: "pastry", name: "Fresh Pastry", description: "Baked daily. Ask what's in the case.", price: 375, category: "food" },
];

export const findItem = (id: string) => MENU.find((item) => item.id === id);

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
