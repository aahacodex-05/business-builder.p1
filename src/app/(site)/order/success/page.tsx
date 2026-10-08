import Link from "next/link";
import { ClearCart } from "@/components/ClearCart";
import { formatPrice } from "@/data/menu";
import { formatAddress } from "@/lib/couriers";
import { readDropoff } from "@/lib/delivery";
import { stripe } from "@/lib/stripe";

export const metadata = { title: "Order placed | Mocha Express Coffee" };

export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const session = session_id
    ? await stripe().checkout.sessions.retrieve(session_id).catch(() => null)
    : null;
  const paid = session?.payment_status === "paid";
  const dropoff = readDropoff(session?.metadata ?? null);

  return (
    <main className="confirm">
      {paid && <ClearCart />}
      <img src="/logo.png" alt="" width={120} height={120} />
      <h1>{paid ? "Order's in!" : "We couldn't find that order"}</h1>
      {paid ? (
        <p>
          Thanks, {session.metadata?.pickupName}. We're making your order now.{" "}
          {dropoff ? (
            <>
              A driver will bring it to <strong>{formatAddress(dropoff)}</strong> and text you when they're close.
            </>
          ) : (
            <>
              Pick it up at <strong>{session.metadata?.location}</strong>.
            </>
          )}{" "}
          Total paid: {formatPrice(session.amount_total ?? 0)}.
        </p>
      ) : (
        <p>If you were charged, show your email receipt at the counter and we'll sort it out.</p>
      )}
      <Link className="btn" href="/">
        Back to Mocha Express
      </Link>
    </main>
  );
}
