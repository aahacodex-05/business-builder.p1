"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { completeDeadline, createDeadline, deadlineInput } from "@/lib/deadlines";
import type { FormState } from "./auth";

export async function addDeadline(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = deadlineInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await createDeadline(user.id, parsed.data);
  revalidatePath("/dashboard");
}

export async function markDone(id: string) {
  const user = await requireUser();
  await completeDeadline(user.id, id);
  revalidatePath("/dashboard");
}
