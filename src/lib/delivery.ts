import type Stripe from "stripe";
import { findLocation } from "@/data/locations";
import { courier, type Dropoff } from "@/lib/couriers";
import { stripe } from "@/lib/stripe";

export type DeliveryForm = Partial<Record<"street" | "unit" | "city" | "zip" | "phone" | "notes", string>>;

/** Checks the customer's delivery details. Returns the dropoff, or a message to show them. */
export function parseDropoff(form: DeliveryForm, name: string): Dropoff | string {
  const field = (key: keyof DeliveryForm, max: number) => (form[key] ?? "").trim().slice(0, max);
  const digits = field("phone", 20).replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  const dropoff = {
    name,
    phone: `+1${digits}`,
    street: field("street", 100),
    unit: field("unit", 30),
    city: field("city", 40),
    zip: field("zip", 10),
    notes: field("notes", 200),
  };

  if (!dropoff.street || !dropoff.city) return "Add the delivery address.";
  if (!/^\d{5}$/.test(dropoff.zip)) return "Add a 5-digit ZIP code.";
  if (digits.length !== 10) return "Add a phone number the driver can call.";
  return dropoff;
}

/** Books the driver for a paid delivery order. Does nothing for pickup orders or ones already booked. */
export async function dispatchDelivery(sessionId: string) {
  const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  const intent = session.payment_intent as Stripe.PaymentIntent | null;
  const { metadata } = session;
  if (session.payment_status !== "paid" || !intent || !metadata?.delivery || intent.metadata.deliveryId) return;

  const shop = findLocation(metadata.locationId);
  const service = courier();
  if (!shop || !service) throw new Error(`Can't book delivery for ${sessionId}`);

  const lines = await stripe().checkout.sessions.listLineItems(sessionId, { limit: 100 });
  const booked = await service.dispatch({
    ref: metadata.deliveryRef,
    shop,
    dropoff: JSON.parse(metadata.delivery),
    orderValue: Number(metadata.orderValue),
    items: lines.data
      .filter(({ description }) => description !== DELIVERY_LINE)
      .map(({ description, quantity }) => ({ name: description ?? "Item", quantity: quantity ?? 1 })),
  });

  await stripe().paymentIntents.update(intent.id, {
    metadata: { deliveryId: booked.id, trackingUrl: booked.trackingUrl ?? "" },
  });
}

/** Name of the delivery fee line on the Stripe receipt. */
export const DELIVERY_LINE = "Delivery";
