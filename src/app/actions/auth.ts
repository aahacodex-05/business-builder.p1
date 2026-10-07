"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export type FormState = { error?: string } | undefined;

const signupInput = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
  timeZone: z.string().refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz)).catch("UTC"),
});

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signupInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, timeZone } = parsed.data;

  const [user] = await db
    .insert(users)
    .values({ name, email, timeZone, passwordHash: await hashPassword(password) })
    .onConflictDoNothing()
    .returning({ id: users.id });
  if (!user) return { error: "An account with that email already exists." };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Wrong email or password." };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
