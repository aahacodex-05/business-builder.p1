import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/** Whether an app checkout was paid, so the app can confirm the order once the browser closes. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await stripe().checkout.sessions.retrieve(id).catch(() => null);
  if (!session) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({
    paid: session.payment_status === "paid",
    name: session.metadata?.pickupName,
    location: session.metadata?.location,
    total: session.amount_total ?? 0,
  });
}
