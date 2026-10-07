import type { User } from "@/db/schema";

/** Stripe subscription statuses that keep the AI assistant and alerts unlocked. */
export const PAID_STATUSES = ["active", "trialing"];

export function isPaid(user: Pick<User, "subscriptionStatus">): boolean {
  return PAID_STATUSES.includes(user.subscriptionStatus ?? "");
}
