import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from './db.js';

const COOKIE = 'session';
const SESSION_DAYS = 30;

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}

export function startSession(res, userId) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(token, userId, expires.toISOString());
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: (process.env.APP_URL || '').startsWith('https://'),
    expires,
  });
}

export function endSession(req, res) {
  const token = readToken(req);
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.clearCookie(COOKIE);
}

/** Attaches req.user when a valid session cookie is present. */
export function loadUser(req, res, next) {
  const token = readToken(req);
  req.user = token
    ? db.prepare(`
        SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE token = ? AND expires_at > ?`).get(token, new Date().toISOString())
    : undefined;
  next();
}

export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  next();
}

export function requirePaid(req, res, next) {
  if (!req.user?.paid) return res.status(402).json({ error: 'Choose a plan to unlock this.' });
  next();
}

function readToken(req) {
  const match = (req.headers.cookie || '').match(/(?:^|;\s*)session=([a-f0-9]{64})/);
  return match?.[1];
}
