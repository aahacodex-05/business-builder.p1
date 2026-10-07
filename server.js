import express from 'express';
import { db } from './src/db.js';
import { checkPassword, endSession, hashPassword, loadUser, requirePaid, requireUser, startSession } from './src/auth.js';
import { createCheckout, createPortal, webhook } from './src/billing.js';
import { PLANS } from './src/plans.js';
import { addDeadline, deleteDeadline, listDeadlines } from './src/deadlines.js';
import { chat, chatHistory, clearChat } from './src/assistant.js';
import { DEFAULT_ALERT_MINUTES, parseAlertMinutes, startAlertScheduler } from './src/alerts.js';

const app = express();

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhook);
app.use(express.json({ limit: '50kb' }), loadUser);
app.use(express.static('public'));

const publicUser = (u) => u && {
  name: u.name,
  email: u.email,
  plan: u.plan,
  paid: Boolean(u.paid),
  timezone: u.timezone,
  alertMinutes: parseAlertMinutes(u.alert_minutes),
};

const validTimezone = (tz) => {
  try { return Intl.DateTimeFormat(undefined, { timeZone: tz }) && tz; } catch { return 'UTC'; }
};

app.get('/api/plans', (req, res) => {
  res.json(Object.entries(PLANS).map(([key, { name, price, summary, featured }]) => ({ key, name, price, summary, featured })));
});

app.get('/api/me', (req, res) => res.json({ user: publicUser(req.user) ?? null }));

app.post('/api/signup', (req, res) => {
  const { name, email, password, timezone } = req.body;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email ?? '') || (password ?? '').length < 8) {
    return res.status(400).json({ error: 'Enter your name, a valid email and a password of 8+ characters.' });
  }
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email.toLowerCase())) {
    return res.status(409).json({ error: 'That email already has an account. Log in instead.' });
  }
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO users (name, email, password_hash, timezone) VALUES (?, ?, ?, ?)',
  ).run(name.trim(), email.toLowerCase(), hashPassword(password), validTimezone(timezone));
  startSession(res, lastInsertRowid);
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(req.body.email ?? '').toLowerCase());
  if (!user || !checkPassword(String(req.body.password ?? ''), user.password_hash)) {
    return res.status(401).json({ error: 'Wrong email or password.' });
  }
  startSession(res, user.id);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  endSession(req, res);
  res.json({ ok: true });
});

app.post('/api/checkout', requireUser, async (req, res) => {
  res.json({ url: await createCheckout(req.user, req.body.plan) });
});

app.post('/api/billing', requireUser, async (req, res) => {
  res.json({ url: await createPortal(req.user) });
});

app.put('/api/settings', requireUser, (req, res) => {
  const minutes = Array.isArray(req.body.alertMinutes)
    ? [...new Set(req.body.alertMinutes.map(Number).filter((n) => Number.isInteger(n) && n > 0))]
    : DEFAULT_ALERT_MINUTES;
  db.prepare('UPDATE users SET alert_minutes = ?, timezone = ? WHERE id = ?')
    .run((minutes.length ? minutes : DEFAULT_ALERT_MINUTES).join(','), validTimezone(req.body.timezone ?? req.user.timezone), req.user.id);
  res.json({ ok: true });
});

app.get('/api/deadlines', requireUser, (req, res) => res.json(listDeadlines(req.user.id)));

app.post('/api/deadlines', requireUser, requirePaid, (req, res) => {
  res.json(addDeadline(req.user.id, req.body));
});

app.delete('/api/deadlines/:id', requireUser, (req, res) => {
  res.json({ deleted: deleteDeadline(req.user.id, Number(req.params.id)) });
});

app.get('/api/chat', requireUser, requirePaid, (req, res) => res.json(chatHistory(req.user.id)));

app.post('/api/chat', requireUser, requirePaid, async (req, res) => {
  const text = String(req.body.message ?? '').trim().slice(0, 4000);
  if (!text) return res.status(400).json({ error: 'Type a message.' });
  res.json({ reply: await chat(req.user, text) });
});

app.delete('/api/chat', requireUser, (req, res) => {
  clearChat(req.user.id);
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  if (!err.expose) console.error(err);
  res.status(err.expose ? err.status : 500).json({ error: err.expose ? err.message : 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`The Business Builder running on http://localhost:${port}`));
startAlertScheduler();
