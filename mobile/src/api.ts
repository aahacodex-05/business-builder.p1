/** The Mocha Express site is the app's backend: same menu, same shops, same Stripe checkout. */
const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? "https://mochaexpresspdx.com").replace(/\/$/, "");

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  /** Price in cents. */
  price: number;
  category: string;
  kind: "drink" | "food";
};

export type Location = {
  id: string;
  name: string;
  services: string[];
  street: string;
  city: string;
  zip: string;
  phone: string;
  hours: { days: string; time: string }[];
  open: boolean;
  directionsUrl: string;
  phoneUrl: string;
};

export type Catalog = {
  categories: { id: string; label: string }[];
  menu: MenuItem[];
  popular: string[];
  locations: Location[];
};

export type Order = { paid: boolean; name?: string; location?: string; total: number };

export type OrderRequest = { lines: Record<string, number>; locationId: string; name: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SITE_URL}${path}`, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
  return body;
}

export const getCatalog = () => request<Catalog>("/api/app/catalog");

export const startCheckout = (order: OrderRequest) =>
  request<{ url: string; id: string }>("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...order, from: "app" }),
  });

export const getOrder = (id: string) => request<Order>(`/api/app/orders/${encodeURIComponent(id)}`);

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
