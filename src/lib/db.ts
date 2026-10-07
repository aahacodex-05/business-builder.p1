import postgres from "postgres";

// Created on first use, so setting up the database is just pasting in its address.
const SCHEMA = `
  create table if not exists employees (
    id uuid primary key default gen_random_uuid(),
    number text not null unique,
    shop text not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    name text,
    password_hash text,
    signed_up_at timestamptz,
    revoked_at timestamptz
  );
  create table if not exists sessions (
    token_hash text primary key,
    role text not null check (role in ('owner', 'employee')),
    employee_id uuid references employees (id) on delete cascade,
    expires_at timestamptz not null
  );
  create table if not exists attempts (
    key text not null,
    window_start timestamptz not null,
    count int not null default 1,
    primary key (key, window_start)
  );
  create index if not exists attempts_window_start on attempts (window_start);
`;

/** Keeps servers starting at the same moment from creating the tables at once. */
const SCHEMA_LOCK = 4_815_162;

let client: postgres.Sql | undefined;
let ready: Promise<unknown> | undefined;

/** The database, with its tables in place. */
export async function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  // No prepared statements, so it also works through a pooled connection such as Neon's.
  client ??= postgres(url, { max: 3, idle_timeout: 20, prepare: false, transform: postgres.camel });
  const sql = client;
  ready ??= sql
    .begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(${SCHEMA_LOCK})`;
      await tx.unsafe(SCHEMA);
    })
    .catch((error) => {
      ready = undefined;
      throw error;
    });

  await ready;
  return sql;
}
