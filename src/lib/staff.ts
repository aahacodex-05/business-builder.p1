import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "mocha-staff";
const MONTH = 60 * 60 * 24 * 30;

/** What the cookie holds for a passcode, so changing the passcode signs every tablet out. */
const token = (passcode: string) => createHmac("sha256", passcode).update(COOKIE).digest();

const matches = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

export async function isStaff() {
  const passcode = process.env.STAFF_PASSCODE;
  const saved = (await cookies()).get(COOKIE)?.value;
  return Boolean(passcode && saved && matches(Buffer.from(saved, "hex"), token(passcode)));
}

/** Signs the visitor in when the passcode is right; returns whether it was. */
export async function signIn(attempt: string) {
  const passcode = process.env.STAFF_PASSCODE;
  if (!passcode || !matches(token(attempt), token(passcode))) return false;

  (await cookies()).set(COOKIE, token(passcode).toString("hex"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MONTH,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
