const MINUTE = 60 * 1000;

/** How long before a deadline each alert goes out: 7 days, 1 day, 1 hour. */
export const REMINDER_OFFSETS_MINUTES = [7 * 24 * 60, 24 * 60, 60];

export interface DueReminder {
  /** The alert to send now: the closest-to-deadline window that has opened. */
  offsetMinutes: number;
  /** Every window that has opened, so earlier ones are never sent late. */
  coveredOffsets: number[];
}

/**
 * Decide which reminder, if any, is due for a deadline. A deadline created
 * 2 hours out gets the 1-day alert once, not the 7-day and 1-day alerts together.
 */
export function dueReminder(dueAt: Date, now: Date, sentOffsets: number[]): DueReminder | null {
  if (dueAt <= now) return null;
  const opened = REMINDER_OFFSETS_MINUTES.filter((m) => dueAt.getTime() - m * MINUTE <= now.getTime());
  if (opened.length === 0) return null;
  const offsetMinutes = Math.min(...opened);
  if (sentOffsets.includes(offsetMinutes)) return null;
  return { offsetMinutes, coveredOffsets: opened };
}

export function describeOffset(minutes: number): string {
  if (minutes >= 24 * 60) {
    const days = Math.round(minutes / (24 * 60));
    return days === 1 ? "1 day" : `${days} days`;
  }
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

export function formatDue(dueAt: Date, timeZone: string): string {
  return dueAt.toLocaleString("en-US", { timeZone, dateStyle: "full", timeStyle: "short" });
}
