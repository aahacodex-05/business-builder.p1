import type Stripe from "stripe";
import { findLocation } from "@/data/locations";
import { formatAddress, type Dropoff } from "@/lib/couriers";
import { DELIVERY_LINE, readDropoff } from "@/lib/delivery";
import { StaffError } from "@/lib/errors";
import { startOfDay } from "@/lib/hours";
import { stripe } from "@/lib/stripe";

export type Order = {
  /** The Stripe payment intent id, which is also what marks the order picked up. */
  id: string;
  placedAt: Date;
  name: string;
  phone?: string;
  total: number;
  items: { name: string; quantity: number }[];
  pickedUp: boolean;
  /** Only on delivery orders. `booked` turns true once a driver is on the way. */
  delivery?: { address: string; notes: string; booked: boolean; trackingUrl?: string };
};

/** Paid pickup and delivery orders placed today at a shop, oldest first. */
export async function todaysOrders(locationId: string) {
  const orders: Order[] = [];
  const sessions = stripe().checkout.sessions.list({
    created: { gte: Math.floor(startOfDay().getTime() / 1000) },
    status: "complete",
    expand: ["data.line_items", "data.payment_intent"],
    limit: 100,
  });

  for await (const session of sessions) {
    const intent = session.payment_intent as Stripe.PaymentIntent | null;
    if (session.metadata?.locationId !== locationId || session.payment_status !== "paid" || !intent) continue;

    orders.push({
      id: intent.id,
      placedAt: new Date(session.created * 1000),
      name: session.metadata.pickupName,
      phone: session.customer_details?.phone ?? undefined,
      total: session.amount_total ?? 0,
      items: (await lineItems(session))
        .filter(({ description }) => description !== DELIVERY_LINE)
        .map(({ description, quantity }) => ({ name: description ?? "Item", quantity: quantity ?? 1 })),
      pickedUp: intent.metadata.pickedUp === "yes",
      delivery: delivery(readDropoff(session.metadata), intent),
    });
  }

  // Stripe lists newest first.
  return orders.reverse();
}

const delivery = (dropoff: Dropoff | undefined, { metadata }: Stripe.PaymentIntent) =>
  dropoff && {
    address: formatAddress(dropoff),
    notes: dropoff.notes,
    booked: Boolean(metadata.deliveryId),
    trackingUrl: metadata.trackingUrl || undefined,
  };

/** An expanded session carries only its first ten lines, so longer orders are fetched in full. */
async function lineItems(session: Stripe.Checkout.Session) {
  const expanded = session.line_items;
  if (expanded && !expanded.has_more) return expanded.data;
  return (await stripe().checkout.sessions.listLineItems(session.id, { limit: 100 })).data;
}

/** Marks a paid order picked up (by the customer, or the driver for deliveries). Pass the employee's shop to refuse orders from any other shop. */
export async function markPickedUp(orderId: string, shop?: string) {
  const intent = await stripe()
    .paymentIntents.retrieve(orderId)
    .catch((error) => {
      if (error.statusCode === 404) return undefined;
      throw error;
    });
  const location = findLocation(intent?.metadata.locationId ?? "");
  if (intent?.status !== "succeeded" || !location || (shop && shop !== location.id)) {
    throw new StaffError("Order not found.", 404);
  }

  await stripe().paymentIntents.update(orderId, { metadata: { pickedUp: "yes" } });
}
