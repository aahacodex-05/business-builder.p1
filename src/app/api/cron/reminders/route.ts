import { and, eq, gt, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { deadlines, remindersSent, users } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { PAID_STATUSES } from "@/lib/plan";
import { REMINDER_OFFSETS_MINUTES, describeOffset, dueReminder, formatDue } from "@/lib/reminders";

const LOOKAHEAD_MS = Math.max(...REMINDER_OFFSETS_MINUTES) * 60 * 1000;

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
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

    try {
      await sendEmail(
        user.email,
        `Reminder: "${deadline.title}" is due in ${describeOffset(reminder.offsetMinutes)}`,
        `Hi ${user.name},\n\n"${deadline.title}" is due ${formatDue(deadline.dueAt, user.timeZone)}.` +
          (deadline.notes ? `\n\n${deadline.notes}` : "") +
          `\n\nManage your deadlines: ${process.env.APP_URL}/dashboard\n\nThe Business Builder`,
      );
    } catch (error) {
      // Leave it unrecorded so the next run retries; don't block other users' alerts.
      console.error(error);
      continue;
    }
    await db
      .insert(remindersSent)
      .values(reminder.coveredOffsets.map((offsetMinutes) => ({ deadlineId: deadline.id, offsetMinutes })))
      .onConflictDoNothing();
    sent++;
  }

  return Response.json({ sent });
}
