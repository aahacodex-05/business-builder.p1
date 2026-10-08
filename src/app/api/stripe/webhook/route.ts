import type Stripe from "stripe";
import { dispatchDelivery } from "@/lib/delivery";
import { stripe } from "@/lib/stripe";

/** Stripe calls this when a checkout is paid; delivery orders get their driver booked here. */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret is not set", { status: 503 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    try {
      await dispatchDelivery(event.data.object.id);
    } catch (error) {
      // A failed answer makes Stripe retry for up to three days.
      console.error("Booking the delivery failed", error);
      return new Response("Booking the delivery failed", { status: 500 });
    }
  }
  return new Response(null, { status: 204 });
}
