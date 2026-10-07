"use client";

import Link from "next/link";
import { OpenStatus } from "@/components/OpenStatus";
import { findLocation } from "@/data/locations";
import { useCart } from "@/lib/cart";

/** Reminds the customer which shop their order will be picked up from. */
export function PickupShop() {
  const shop = findLocation(useCart().locationId);
  if (!shop) return null;

  return (
    <div className="pickup">
      <span>
        Pickup at <strong>{shop.name}</strong>
      </span>
      <OpenStatus hours={shop.hours} />
      <Link href="/#locations">Change</Link>
    </div>
  );
}
