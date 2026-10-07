import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
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
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    await db.update(users).set({ subscriptionStatus: subscription.status }).where(eq(users.stripeCustomerId, customerId));
  }

  return new Response(null, { status: 204 });
}
