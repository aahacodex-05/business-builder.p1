import { db } from './db.js';
import { sendMail } from './mail.js';

export const DEFAULT_ALERT_MINUTES = [10080, 1440, 60];

/**
 * Decides which alert windows have opened for a deadline.
 * Windows that opened together collapse into one email, so a user never
 * gets a "7 days left" email after the "1 hour left" one.
 */
export function openWindows(dueAt, now, alertMinutes, sent) {
  const minutesLeft = (dueAt - now) / 60000;
  if (minutesLeft <= 0) return [];
  return alertMinutes.filter((m) => minutesLeft <= m && !sent.has(m));
}

export function formatTimeLeft(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return plural(minutes, 'minute');
  if (minutes < 1440) return plural(Math.round(minutes / 60), 'hour');
  return plural(Math.round(minutes / 1440), 'day');
}

const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`;

export function parseAlertMinutes(value) {
  return value.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
}

export async function sendDueAlerts(now = new Date()) {
  const rows = db.prepare(`
    SELECT d.id, d.title, d.due_at, u.email, u.name, u.timezone, u.alert_minutes
    FROM deadlines d JOIN users u ON u.id = d.user_id
    WHERE u.paid = 1 AND d.due_at > ?`).all(now.toISOString());

  const sentFor = db.prepare('SELECT minutes FROM alerts_sent WHERE deadline_id = ?');
  const markSent = db.prepare('INSERT OR IGNORE INTO alerts_sent (deadline_id, minutes) VALUES (?, ?)');

  for (const row of rows) {
    const due = new Date(row.due_at);
    const sent = new Set(sentFor.all(row.id).map((r) => r.minutes));
    const windows = openWindows(due, now, parseAlertMinutes(row.alert_minutes), sent);
    if (!windows.length) continue;

    const left = formatTimeLeft(due - now);
    const when = due.toLocaleString('en-US', { timeZone: row.timezone, dateStyle: 'full', timeStyle: 'short' });
    try {
      await sendMail({
        to: row.email,
        subject: `Reminder: ${row.title} is due in ${left}`,
        text: `Hi ${row.name},\n\n"${row.title}" is due in ${left} (${when}).\n\nMilepost`,
      });
      for (const m of windows) markSent.run(row.id, m);
    } catch (err) {
      console.error(`[alerts] deadline ${row.id}:`, err.message);
    }
  }
}

export function startAlertScheduler() {
  let running = false;
  const tick = async () => {
    if (running) return; // a slow mail server must not cause a second send
    running = true;
    await sendDueAlerts().catch((err) => console.error('[alerts]', err));
    running = false;
  };
  tick();
  return setInterval(tick, 60_000);
}
