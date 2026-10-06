export type Kind = "drink" | "food";

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  /** Price in cents. */
  price: number;
  category: string;
  kind: Kind;
};

type Entry = [name: string, price: number, description?: string];

const SECTIONS: { label: string; kind: Kind; items: Entry[] }[] = [
  {
    label: "New Food",
    kind: "food",
    items: [
      ["Hummus with Pita Bread", 1199, "Vegan."],
      ["Dolma", 1199, "Grape leaves stuffed with rice, Mediterranean spices and lemon juice. Comes with tzatziki sauce."],
      [
        "Za'atar Pizza",
        899,
        "Personal size (7 inch). A blend of dried thyme, sesame seeds, cumin, coriander and other savory herbs mixed with olive oil.",
      ],
    ],
  },
  {
    label: "Mochas",
    kind: "drink",
    items: [
      ["Mocha", 450],
      ["Snickers Mocha", 550],
      ["White Chocolate Mocha", 550],
      ["German Chocolate Mocha", 550],
      ["Black and White Mocha", 550],
      ["Black Forest Mocha", 550],
      ["Raspberry Mocha", 550],
      ["Nutella Mocha", 550],
    ],
  },
  {
    label: "Lattes",
    kind: "drink",
    items: [
      ["Latte", 450],
      ["Chai Latte", 450],
      ["Vanilla Latte", 550],
      ["Caramel Latte", 550],
      ["Kahlua Kicker", 550],
      ["Matcha Latte", 550],
    ],
  },
  {
    label: "Espresso Drinks",
    kind: "drink",
    items: [
      ["Americano", 300],
      ["Eagle Vision Buzz", 750, "20 oz. High caffeine."],
      ["Eagle Vision Missile", 450],
    ],
  },
  {
    label: "Blended Coffee",
    kind: "drink",
    items: [
      ["Caramel Frappe", 750],
      ["Mint Frappe", 750],
      ["Mocha Frappe", 650],
      ["Snickers Frappe", 750],
      ["Twix Frappe", 750],
      ["Mexican Mocha Frappe", 750],
    ],
  },
  {
    label: "Bubble Tea",
    kind: "drink",
    items: [
      ["Thai Bubble Tea", 600],
      ["Taro Bubble Tea", 600],
      ["Lavender Bubble Tea", 600],
      ["Original Bubble Tea", 600],
      ["Green Bubble Tea", 600],
      ["Strawberry Bubble Tea", 600],
      ["Watermelon Bubble Tea", 600],
      ["Mango Bubble Tea", 600, "20 oz."],
    ],
  },
  {
    label: "Other Drinks",
    kind: "drink",
    items: [
      ["House Coffee", 200],
      ["Hot Chocolate", 350],
      ["Vanilla Steamer", 350],
      ["Italian Soda", 350],
      ["Hot Cider", 500, "16 oz."],
      ["Apple Juice", 300, "16 oz."],
    ],
  },
  {
    label: "Real Fruit Smoothies",
    kind: "drink",
    items: [
      ["Strawberry Banana Smoothie", 700],
      ["Very Berry Smoothie", 700],
      ["Peach Strawberry Smoothie", 700],
      ["Pineapple Strawberry Smoothie", 700],
      ["Berry Orange Smoothie", 700],
      ["Mango Smoothie", 700],
    ],
  },
  {
    label: "Shakes",
    kind: "drink",
    items: [
      ["Mocha Shake", 750, "16 oz."],
      ["Mexican Shake", 850],
      ["Peanut Butter Shake", 850, "Made with real ice cream."],
      ["Eagle Vision Shake", 850],
      ["Chocolate Shake", 750, "Made with real ice cream."],
      ["Strawberry Shake", 850, "Made with real ice cream."],
      ["Protein Shake", 700, "Made with real ice cream."],
    ],
  },
  {
    label: "Pastries & Food",
    kind: "food",
    items: [
      ["Toasted Bagel and Cream Cheese", 599],
      ["Egg and Cheese Toasted Bagel", 999],
      ["Blueberry Muffin", 395],
      ["Poppyseed Muffin", 395],
      ["Cinnamon Roll", 395],
      ["Apple Fritter", 395],
    ],
  },
  {
    label: "Energy Drinks",
    kind: "drink",
    items: [
      ["Infused Energy Drink", 650],
      ["Energy Drink Smoothie", 850, "20 oz."],
      ["Energy Drink in a Can", 400],
    ],
  },
  {
    label: "Keto",
    kind: "drink",
    items: [["Bulletproof Coffee", 700, "High caffeine, with high-quality butter and MCT oil."]],
  },
  {
    label: "All-Day Breakfast",
    kind: "food",
    items: [
      ["Panini Breakfast Sandwich", 1299, "Egg, Tillamook cheese and sausage."],
      ["Panini Egg and Cheese", 1099, "Egg and Tillamook cheese."],
      ["Panini Grilled Cheese", 999],
    ],
  },
];

/** "Za'atar Pizza" → "zaatar-pizza" */
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const CATEGORIES = SECTIONS.map(({ label }) => ({ id: slug(label), label }));

export const MENU: MenuItem[] = SECTIONS.flatMap(({ label, kind, items }) =>
  items.map(([name, price, description]) => ({ id: slug(name), name, description, price, category: slug(label), kind })),
);

const POPULAR_IDS = new Set([
  "mocha",
  "chai-latte",
  "mexican-shake",
  "egg-and-cheese-toasted-bagel",
  "panini-breakfast-sandwich",
  "panini-grilled-cheese",
]);

/** Featured on the home page and at the top of the menu. */
export const POPULAR = MENU.filter((item) => POPULAR_IDS.has(item.id));

export const findItem = (id: string) => MENU.find((item) => item.id === id);

export const categoryLabel = (id: string) => CATEGORIES.find((category) => category.id === id)?.label;

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
