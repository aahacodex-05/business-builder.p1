import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { deadlines } from "@/db/schema";

export const deadlineInput = z.object({
  title: z.string().trim().min(1).max(200),
  dueAt: z.coerce.date().refine((d) => d > new Date(), "Due date must be in the future"),
  notes: z.string().trim().max(2000).optional(),
});

export function listDeadlines(userId: string) {
  return db
    .select()
    .from(deadlines)
    .where(and(eq(deadlines.userId, userId), eq(deadlines.done, false)))
    .orderBy(asc(deadlines.dueAt));
}

export async function createDeadline(userId: string, input: z.infer<typeof deadlineInput>) {
  const [row] = await db
    .insert(deadlines)
    .values({ userId, title: input.title, dueAt: input.dueAt, notes: input.notes || null })
    .returning();
  return row;
}

export async function completeDeadline(userId: string, id: string) {
  const [row] = await db
    .update(deadlines)
    .set({ done: true })
    .where(and(eq(deadlines.id, id), eq(deadlines.userId, userId)))
    .returning();
  return row ?? null;
}
