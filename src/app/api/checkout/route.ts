import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { findItem } from "@/data/menu";
import { findLocation } from "@/data/locations";
import { CourierError, courier } from "@/lib/couriers";
import { DELIVERY_LINE, parseDropoff, type DeliveryForm } from "@/lib/delivery";
import { isOpen } from "@/lib/hours";
import { stripe } from "@/lib/stripe";

type CheckoutRequest = {
  lines: Record<string, number>;
  locationId: string;
  name: string;
  /** Present for delivery orders. */
  delivery?: DeliveryForm;
};

const MAX_QUANTITY = 20;

export async function POST(request: Request) {
  const { lines, locationId, name, delivery } = (await request.json()) as CheckoutRequest;

  const location = findLocation(locationId);
  if (!location) return error(delivery ? "Pick a shop to deliver from." : "Pick a pickup location.");
  if (!name?.trim()) return error("Add a name for the order.");
  if (!isOpen(location.hours)) return error(`${location.name} is closed right now. Online ordering opens with the shop.`);

  // Prices always come from the server-side menu, never from the client.
  const items = Object.entries(lines ?? {}).flatMap(([id, quantity]) => {
    const item = findItem(id);
    return item && Number.isInteger(quantity) && quantity > 0 && quantity <= MAX_QUANTITY
      ? [{ item, quantity }]
      : [];
  });
  if (items.length === 0) return error("Your cart is empty.");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const pickupName = name.trim().slice(0, 80);
  const orderValue = items.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const metadata: Record<string, string> = { locationId: location.id, location: location.name, pickupName };
  const lineItems = items.map(({ item, quantity }) => line(item.name, item.price, quantity));

  if (delivery) {
    const service = courier();
    if (!service) return error("Delivery isn't available right now. Choose pickup.");
    const dropoff = parseDropoff(delivery, pickupName);
    if (typeof dropoff === "string") return error(dropoff);

    const deliveryRef = randomUUID();
    try {
      const { fee } = await service.quote({ ref: deliveryRef, shop: location, dropoff, orderValue, items: [] });
      lineItems.push(line(DELIVERY_LINE, fee, 1));
    } catch (err) {
      if (err instanceof CourierError) return error(err.message);
      console.error("Delivery quote failed", err);
      return error("Delivery isn't available right now. Choose pickup.", 502);
    }
    Object.assign(metadata, { deliveryRef, delivery: JSON.stringify(dropoff), orderValue: String(orderValue) });
  }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
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

const error = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

const line = (name: string, cents: number, quantity: number) => ({
  quantity,
  price_data: { currency: "usd", unit_amount: cents, product_data: { name } },
});
