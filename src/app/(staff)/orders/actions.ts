"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signInEmployee, signInOwner, signUpEmployee } from "@/lib/accounts";
import { addEmployeeNumber, revokeEmployee as revokeEmployeeAccess } from "@/lib/employees";
import { StaffError } from "@/lib/errors";
import { markPickedUp as markOrderPickedUp } from "@/lib/orders";
import { endWebSession, setWebSession, webStaff, type Session } from "@/lib/staff";
import { clientIp } from "@/lib/throttle";

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

/** Runs a sign-in or sign-up. A problem comes back as the message to show; success sends the person on. */
async function enter(start: (ip: string) => Promise<Session>) {
  let session: Session;
  try {
    session = await start(clientIp(await headers()));
  } catch (error) {
    if (error instanceof StaffError) return error.message;
    throw error;
  }

  await setWebSession(session);
  redirect(session.staff.role === "owner" ? "/orders/owner" : `/orders/${session.staff.shop}`);
}

export async function signIn(form: FormData) {
  return enter((ip) => signInEmployee(text(form, "number"), text(form, "password"), ip));
}

export async function signUp(form: FormData) {
  if (text(form, "password") !== text(form, "confirm")) return "The two passwords don't match.";
  const fields = { number: text(form, "number"), name: text(form, "name"), password: text(form, "password") };
  return enter((ip) => signUpEmployee(fields, ip));
}

export async function ownerSignIn(form: FormData) {
  return enter((ip) => signInOwner(text(form, "code"), ip));
}

export async function signOut() {
  await endWebSession();
  redirect("/orders");
}

export async function markPickedUp(orderId: string) {
  const staff = await webStaff();
  if (!staff) return;
  await markOrderPickedUp(orderId, staff.role === "employee" ? staff.shop : undefined);
  refresh();
}

async function requireOwner() {
  if ((await webStaff())?.role !== "owner") throw new StaffError("Only the owner can do that.", 403);
}

export async function addEmployee(form: FormData) {
  await requireOwner();
  await addEmployeeNumber(text(form, "shop"));
  refresh();
}

export async function revokeEmployee(id: string) {
  await requireOwner();
  await revokeEmployeeAccess(id);
  refresh();
}
