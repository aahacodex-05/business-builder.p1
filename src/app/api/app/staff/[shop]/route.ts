import { NextResponse } from "next/server";
import { findLocation } from "@/data/locations";
import { markPickedUp, todaysOrders } from "@/lib/orders";
import { isStaffRequest } from "@/lib/staff";

type Context = { params: Promise<{ shop: string }> };

/** A shop's paid pickup orders from today, for the app's staff screen. */
export async function GET(request: Request, { params }: Context) {
  const location = findLocation((await params).shop);
  if (!isStaffRequest(request)) return unauthorized();
  if (!location) return NextResponse.json({ error: "Shop not found." }, { status: 404 });

  return NextResponse.json({ orders: await todaysOrders(location.id) });
}

/** Marks an order picked up. */
export async function POST(request: Request) {
  if (!isStaffRequest(request)) return unauthorized();
  const { paymentIntentId } = (await request.json()) as { paymentIntentId?: string };
  if (!paymentIntentId) return NextResponse.json({ error: "Missing order." }, { status: 400 });

  await markPickedUp(paymentIntentId);
  return NextResponse.json({ ok: true });
}

const unauthorized = () => NextResponse.json({ error: "Sign in again." }, { status: 401 });
