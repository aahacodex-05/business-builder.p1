import { DatabaseSync } from 'node:sqlite';

export const db = new DatabaseSync(process.env.DATABASE_PATH || 'data.db');

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    plan TEXT,
    paid INTEGER NOT NULL DEFAULT 0,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    alert_minutes TEXT NOT NULL DEFAULT '10080,1440,60',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS deadlines (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS alerts_sent (
    deadline_id INTEGER NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
    minutes INTEGER NOT NULL,
    PRIMARY KEY (deadline_id, minutes)
  );

  CREATE TABLE IF NOT EXISTS chats (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    messages TEXT NOT NULL
  );
`);
