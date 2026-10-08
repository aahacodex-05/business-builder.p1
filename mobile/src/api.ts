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

/** An error from the site, with a message that's fine to show. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SITE_URL}${path}`, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.error ?? "Something went wrong. Please try again.", response.status);
  return body;
}

const json = (body: unknown, token?: string): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...auth(token) },
  body: JSON.stringify(body),
});

const auth = (token?: string): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {});

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

export type Staff = { role: "employee"; id: string; name: string; shop: string } | { role: "owner" };

export type Session = { token: string; staff: Staff };

export type StaffOrder = {
  id: string;
  placedAt: string;
  name: string;
  phone?: string;
  total: number;
  items: { name: string; quantity: number }[];
  pickedUp: boolean;
};

export type Employee = {
  id: string;
  number: string;
  shop: string;
  name: string | null;
  status: "pending" | "expired" | "active";
  expiresAt: string;
  signedUpAt: string | null;
};

// Staff accounts: see docs/staff-api.md on the site.
export const signUp = (details: { number: string; name: string; password: string }) =>
  request<Session>("/api/staff/signup", json(details));

export const signIn = (number: string, password: string) =>
  request<Session>("/api/staff/login", json({ number, password }));

export const ownerSignIn = (code: string) => request<Session>("/api/owner/login", json({ code }));

export const endSession = (token: string) => request("/api/staff/logout", { method: "POST", headers: auth(token) });

export const getMe = (token: string) =>
  request<{ staff: Staff }>("/api/staff/me", { headers: auth(token) }).then(({ staff }) => staff);

/** Employees always get their own shop; the owner names one. */
export const getStaffOrders = (token: string, shop?: string) =>
  request<{ shop: string; orders: StaffOrder[] }>(`/api/staff/orders${shop ? `?shop=${shop}` : ""}`, {
    headers: auth(token),
  });

export const markPickedUp = (token: string, id: string) =>
  request(`/api/staff/orders/${encodeURIComponent(id)}/picked-up`, { method: "POST", headers: auth(token) });

export const getEmployees = (token: string) =>
  request<{ employees: Employee[] }>("/api/owner/employees", { headers: auth(token) }).then(
    ({ employees }) => employees,
  );

export const addEmployee = (token: string, shop: string) =>
  request<{ employee: Employee }>("/api/owner/employees", json({ shop }, token)).then(({ employee }) => employee);

export const removeEmployee = (token: string, id: string) =>
  request(`/api/owner/employees/${encodeURIComponent(id)}`, { method: "DELETE", headers: auth(token) });

/** "12345678" → "1234 5678" */
export const formatNumber = (number: string) => number.replace(/^(\d{4})(\d{4})$/, "$1 $2");

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric" });
