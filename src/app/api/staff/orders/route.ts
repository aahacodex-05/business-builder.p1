import { NextResponse } from "next/server";
import { findLocation } from "@/data/locations";
import { requireStaff, route } from "@/lib/api";
import { StaffError } from "@/lib/errors";
import { todaysOrders } from "@/lib/orders";
import { canSee } from "@/lib/staff";

/** Today's paid orders at a shop. Employees get their own shop; the owner names one with `?shop=`. */
export const GET = route(async (request) => {
  const staff = await requireStaff(request);
  const shop = new URL(request.url).searchParams.get("shop") ?? (staff.role === "employee" ? staff.shop : "");

  if (!findLocation(shop)) throw new StaffError("Pick a shop.");
  if (!canSee(staff, shop)) throw new StaffError("That isn't your shop.", 403);
  return NextResponse.json({ shop, orders: await todaysOrders(shop) });
});
