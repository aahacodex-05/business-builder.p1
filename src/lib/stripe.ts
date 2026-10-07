import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

export function stripe(): Stripe {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
