import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export type Staff = { role: "owner" } | { role: "employee"; id: string; name: string; shop: string };

/** A signed-in session. Only the hash of `token` is kept, so the token can't be recovered from the database. */
export type Session = { token: string; maxAge: number; staff: Staff };

const COOKIE = "mocha-staff";
const HOUR = 60 * 60;
// The owner's session is short; shop tablets stay signed in for a month.
const LIFETIME = { owner: 8 * HOUR, employee: 30 * 24 * HOUR };

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export const canSee = (staff: Staff, shop: string) => staff.role === "owner" || staff.shop === shop;

export async function createSession(staff: Staff): Promise<Session> {
  const sql = await db();
  const token = randomBytes(32).toString("base64url");
  const maxAge = LIFETIME[staff.role];

  await sql`delete from sessions where expires_at < now()`;
  await sql`
    insert into sessions (token_hash, role, employee_id, expires_at)
    values (${digest(token)}, ${staff.role}, ${staff.role === "employee" ? staff.id : null},
            now() + make_interval(secs => ${maxAge}))`;
  return { token, maxAge, staff };
}

/** Who a session token belongs to, unless it has expired or that employee's access was revoked. */
export async function staffFor(token: string | undefined) {
  if (!token) return undefined;
  const sql = await db();
  const [row] = await sql<{ staff: Staff }[]>`
    select case when s.role = 'owner'
                then jsonb_build_object('role', 'owner')
                else jsonb_build_object('role', 'employee', 'id', e.id, 'name', e.name, 'shop', e.shop) end as staff
    from sessions s left join employees e on e.id = s.employee_id
    where s.token_hash = ${digest(token)} and s.expires_at > now() and (s.role = 'owner' or e.revoked_at is null)`;
  return row?.staff;
}

export async function endSession(token: string | undefined) {
  if (!token) return;
  const sql = await db();
  await sql`delete from sessions where token_hash = ${digest(token)}`;
}

/** The staff member signed in on this website request. The app sends its token in a header instead. */
export async function webStaff() {
  return staffFor((await cookies()).get(COOKIE)?.value);
}

export async function setWebSession({ token, maxAge }: Session) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function endWebSession() {
  const store = await cookies();
  await endSession(store.get(COOKIE)?.value);
  store.delete(COOKIE);
}
