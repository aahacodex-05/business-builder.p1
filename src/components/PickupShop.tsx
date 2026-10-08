"use client";

import Link from "next/link";
import { OpenStatus } from "@/components/OpenStatus";
import { findLocation } from "@/data/locations";
import { useCart } from "@/lib/cart";

/** Reminds the customer which shop their order will be picked up or delivered from. */
export function PickupShop() {
  const { locationId, delivering } = useCart();
  const shop = findLocation(locationId);
  if (!shop) return null;

  return (
    <div className="pickup">
      <span>
        {delivering ? "Delivery from" : "Pickup at"} <strong>{shop.name}</strong>
      </span>
      <OpenStatus hours={shop.hours} />
      <Link href="/#locations">Change</Link>
    </div>
  );
}
