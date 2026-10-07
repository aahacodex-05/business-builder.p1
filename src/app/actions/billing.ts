"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

const appUrl = () => process.env.APP_URL!;

export async function startCheckout() {
  const user = await requireUser();
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe().customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl()}/dashboard?subscribed=1`,
    cancel_url: `${appUrl()}/dashboard`,
  });
  redirect(session.url!);
}

export async function openBillingPortal() {
  const user = await requireUser();
  if (!user.stripeCustomerId) redirect("/dashboard");
  const session = await stripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl()}/dashboard`,
  });
  redirect(session.url);
}
