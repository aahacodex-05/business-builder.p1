import { redirect } from "next/navigation";

/** Stripe only returns to web addresses, so app checkouts land here and bounce back into the app. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("session_id");
  redirect(id ? `mochaexpress://order?id=${encodeURIComponent(id)}` : "mochaexpress://bag");
}
