"use server";

import { refresh } from "next/cache";
import { markPickedUp as markIntentPickedUp } from "@/lib/orders";
import { isStaff, signIn as signInStaff, signOut as signOutStaff } from "@/lib/staff";

export async function signIn(_previous: string | undefined, formData: FormData) {
  const passcode = formData.get("passcode");
  if (typeof passcode === "string" && (await signInStaff(passcode))) return undefined;
  return "That passcode isn't right.";
}

export async function signOut() {
  await signOutStaff();
}

export async function markPickedUp(paymentIntentId: string) {
  if (!(await isStaff())) return;
  await markIntentPickedUp(paymentIntentId);
  refresh();
}
