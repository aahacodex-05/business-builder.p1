import type Stripe from "stripe";
import { startOfDay } from "@/lib/hours";
import { stripe } from "@/lib/stripe";

export type Order = {
  id: string;
  paymentIntentId: string;
  placedAt: Date;
  name: string;
  phone?: string;
  total: number;
  items: { name: string; quantity: number }[];
  pickedUp: boolean;
};

/** Paid pickup orders placed today at a shop, oldest first. */
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
      id: session.id,
      paymentIntentId: intent.id,
      placedAt: new Date(session.created * 1000),
      name: session.metadata.pickupName,
      phone: session.customer_details?.phone ?? undefined,
      total: session.amount_total ?? 0,
      items: (await lineItems(session)).map(({ description, quantity }) => ({
        name: description ?? "Item",
        quantity: quantity ?? 1,
      })),
      pickedUp: intent.metadata.pickedUp === "yes",
    });
  }

  // Stripe lists newest first.
  return orders.reverse();
}

/** An expanded session carries only its first ten lines, so longer orders are fetched in full. */
async function lineItems(session: Stripe.Checkout.Session) {
  const expanded = session.line_items;
  if (expanded && !expanded.has_more) return expanded.data;
  return (await stripe().checkout.sessions.listLineItems(session.id, { limit: 100 })).data;
}

export async function markPickedUp(paymentIntentId: string) {
  await stripe().paymentIntents.update(paymentIntentId, { metadata: { pickedUp: "yes" } });
}
