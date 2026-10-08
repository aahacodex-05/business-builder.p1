import { NextResponse } from "next/server";
import { MAX_QUANTITY, findItem } from "@/data/menu";
import { findLocation } from "@/data/locations";
import { isOpen } from "@/lib/hours";
import { stripe } from "@/lib/stripe";

type CheckoutRequest = {
  lines: Record<string, number>;
  locationId: string;
  name: string;
};

export async function POST(request: Request) {
  const { lines, locationId, name } = (await request.json()) as CheckoutRequest;

  const location = findLocation(locationId);
  if (!location) return error("Pick a pickup location.");
  if (!name?.trim()) return error("Add a name for the order.");
  if (!isOpen(location.hours)) return error(`${location.name} is closed right now. Online ordering opens with the shop.`);

  // Prices always come from the server-side menu, never from the client.
  const items = Object.entries(lines ?? {}).flatMap(([id, quantity]) => {
    const item = findItem(id);
    return item && Number.isInteger(quantity) && quantity > 0 ? [{ item, quantity }] : [];
  });
  if (items.length === 0) return error("Your cart is empty.");
  if (items.some(({ quantity }) => quantity > MAX_QUANTITY)) {
    return error(`You can order up to ${MAX_QUANTITY} of each item online. For more, call the shop.`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const metadata = { locationId: location.id, location: location.name, pickupName: name.trim().slice(0, 80) };

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: items.map(({ item, quantity }) => ({
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.price,
          product_data: { name: item.name },
        },
      })),
      metadata,
      payment_intent_data: { metadata },
      phone_number_collection: { enabled: true },
      success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/menu`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout failed", err);
    return NextResponse.json(
      { error: "Checkout is unavailable right now. Please try again." },
      { status: 502 },
    );
  }
}

const error = (message: string) => NextResponse.json({ error: message }, { status: 400 });
