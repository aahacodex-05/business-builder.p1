import type { Location } from "@/data/locations";

/** Where the driver takes the order. `phone` is E.164 (+15035550101). */
export type Dropoff = {
  name: string;
  phone: string;
  street: string;
  unit: string;
  city: string;
  zip: string;
  notes: string;
};

export type DeliveryJob = {
  /** Our id for the delivery; couriers use it to refuse duplicates. */
  ref: string;
  shop: Location;
  dropoff: Dropoff;
  /** Order value in cents, before the delivery fee. */
  orderValue: number;
  items: { name: string; quantity: number }[];
};

export type Courier = {
  name: string;
  /** The fee in cents, or a CourierError when the address can't be served. */
  quote(job: DeliveryJob): Promise<{ fee: number }>;
  /** Books a driver. Safe to call again with the same job. */
  dispatch(job: DeliveryJob): Promise<{ id: string; trackingUrl?: string }>;
};

/** The courier said no (out of range, bad address). The message is safe to show customers. */
export class CourierError extends Error {}

export type Address = Pick<Dropoff, "street" | "city" | "zip"> & { unit?: string };

export const formatAddress = ({ street, unit, city, zip }: Address) =>
  `${street}${unit ? ` ${unit}` : ""}, ${city}, OR ${zip}`;

export const shopPhone = ({ phone }: Location) => `+1${phone.replace(/\D/g, "")}`;

export const OUT_OF_RANGE = "We can't deliver to that address. Check it, or choose pickup.";
