import { NextResponse } from "next/server";
import { directionsUrl, LOCATIONS, phoneUrl } from "@/data/locations";
import { CATEGORIES, MENU, POPULAR } from "@/data/menu";
import { hoursLabels, isOpen } from "@/lib/hours";

export const dynamic = "force-dynamic";

/** The menu and shops for the Mocha Express app, so the site stays the one place to edit them. */
export function GET() {
  return NextResponse.json({
    categories: CATEGORIES,
    menu: MENU,
    popular: POPULAR.map((item) => item.id),
    locations: LOCATIONS.map((location) => ({
      ...location,
      hours: hoursLabels(location.hours),
      open: isOpen(location.hours),
      directionsUrl: directionsUrl(location),
      phoneUrl: phoneUrl(location),
    })),
  });
}
