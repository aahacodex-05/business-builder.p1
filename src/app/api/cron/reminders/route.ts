import { and, eq, gt, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { deadlines, remindersSent, users } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { PAID_STATUSES } from "@/lib/plan";
import { REMINDER_OFFSETS_MINUTES, describeOffset, dueReminder, formatDue } from "@/lib/reminders";

const LOOKAHEAD_MS = Math.max(...REMINDER_OFFSETS_MINUTES) * 60 * 1000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const upcoming = await db
    .select({ deadline: deadlines, user: users })
    .from(deadlines)
    .innerJoin(users, eq(users.id, deadlines.userId))
    .where(
      and(
        eq(deadlines.done, false),
        gt(deadlines.dueAt, now),
        lte(deadlines.dueAt, new Date(now.getTime() + LOOKAHEAD_MS)),
        inArray(users.subscriptionStatus, PAID_STATUSES),
      ),
    );
  if (upcoming.length === 0) return Response.json({ sent: 0 });

  const sentRows = await db
    .select()
    .from(remindersSent)
    .where(inArray(remindersSent.deadlineId, upcoming.map((u) => u.deadline.id)));

  let sent = 0;
  for (const { deadline, user } of upcoming) {
    const already = sentRows.filter((r) => r.deadlineId === deadline.id).map((r) => r.offsetMinutes);
    const reminder = dueReminder(deadline.dueAt, now, already);
    if (!reminder) continue;

    // Claim the alert before sending so overlapping runs can't both send it.
    const claimed = await db
      .insert(remindersSent)
      .values(reminder.coveredOffsets.map((offsetMinutes) => ({ deadlineId: deadline.id, offsetMinutes })))
      .onConflictDoNothing()
      .returning({ offsetMinutes: remindersSent.offsetMinutes });
    if (!claimed.some((c) => c.offsetMinutes === reminder.offsetMinutes)) continue;

    try {
      await sendEmail(
        user.email,
        `Reminder: "${deadline.title}" is due in ${describeOffset(reminder.offsetMinutes)}`,
        `Hi ${user.name},\n\n"${deadline.title}" is due ${formatDue(deadline.dueAt, user.timeZone)}.` +
          (deadline.notes ? `\n\n${deadline.notes}` : "") +
          `\n\nManage your deadlines: ${process.env.APP_URL}/dashboard\n\nThe Business Builder`,
      );
      sent++;
    } catch (error) {
      // Release the claim so the next run retries; don't block other users' alerts.
      console.error(error);
      await db
        .delete(remindersSent)
        .where(
          and(
            eq(remindersSent.deadlineId, deadline.id),
            inArray(remindersSent.offsetMinutes, claimed.map((c) => c.offsetMinutes)),
          ),
        );
    }
  }

  return Response.json({ sent });
}
