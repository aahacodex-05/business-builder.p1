import { doordash } from "./doordash";
import type { Courier } from "./shared";
import { stub } from "./stub";
import { uber } from "./uber";

export * from "./shared";

/** The courier set in DELIVERY_COURIER, or undefined when the site doesn't deliver. */
export function courier(): Courier | undefined {
  switch (process.env.DELIVERY_COURIER) {
    case "doordash":
      return doordash;
    case "uber":
      return uber;
    case "stub":
      return stub;
  }
}
