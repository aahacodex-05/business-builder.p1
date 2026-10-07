import { db } from './db.js';
import { userError } from './errors.js';

export function listDeadlines(userId) {
  return db.prepare(`
    SELECT id, title, due_at FROM deadlines
    WHERE user_id = ? AND due_at > ? ORDER BY due_at`).all(userId, new Date().toISOString());
}

export function addDeadline(userId, { title, due_at }) {
  title = String(title ?? '').trim();
  const due = new Date(due_at);
  if (!title) throw userError(400, 'Give the deadline a title.');
  if (Number.isNaN(due.getTime())) throw userError(400, 'Invalid date.');
  if (due <= new Date()) throw userError(400, 'That time has already passed.');

  const { lastInsertRowid } = db.prepare('INSERT INTO deadlines (user_id, title, due_at) VALUES (?, ?, ?)')
    .run(userId, title.slice(0, 200), due.toISOString());
  return { id: Number(lastInsertRowid), title, due_at: due.toISOString() };
}

export function deleteDeadline(userId, id) {
  return db.prepare('DELETE FROM deadlines WHERE id = ? AND user_id = ?').run(id, userId).changes > 0;
}
