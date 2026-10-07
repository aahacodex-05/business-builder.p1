import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { PAID_STATUSES } from "@/lib/plan";
import { stripe } from "@/lib/stripe";

const SUBSCRIPTION_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: Request) {
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") ?? "",
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (SUBSCRIPTION_EVENTS.has(event.type)) {
    const { customer } = event.data.object as Stripe.Subscription;
    const customerId = typeof customer === "string" ? customer : customer.id;
    await db
      .update(users)
      .set({ subscriptionStatus: await currentStatus(customerId) })
      .where(eq(users.stripeCustomerId, customerId));
  }

  return new Response(null, { status: 204 });
}

/** Read the customer's live state so late or out-of-order events can't overwrite a newer subscription. */
async function currentStatus(customerId: string): Promise<string | null> {
  const { data } = await stripe().subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  const paid = data.find((s) => PAID_STATUSES.includes(s.status));
  return (paid ?? data[0])?.status ?? null;
}
