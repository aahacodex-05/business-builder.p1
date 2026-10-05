import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { data: items } = await stripe().checkout.sessions.listLineItems(session.id);

    // TODO: notify the shop (email, SMS or order screen) once the channel is decided.
    console.log("New order", {
      id: session.id,
      location: session.metadata?.location,
      pickupName: session.metadata?.pickupName,
      phone: session.customer_details?.phone,
      total: session.amount_total,
      items: items.map((item) => `${item.quantity} × ${item.description}`),
    });
  }

  return new Response(null, { status: 200 });
}
