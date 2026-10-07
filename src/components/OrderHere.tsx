"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

/** Opens the menu with this shop already chosen for pickup. */
export function OrderHere({ locationId }: { locationId: string }) {
  const { setLocationId } = useCart();

  return (
    <Link className="btn btn--small" href="/menu" onClick={() => setLocationId(locationId)}>
      Order here
    </Link>
  );
}
