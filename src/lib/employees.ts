import { randomInt } from "node:crypto";
import { findLocation } from "@/data/locations";
import { db } from "@/lib/db";
import { StaffError } from "@/lib/errors";

const INVITE_DAYS = 14;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Employee = {
  id: string;
  number: string;
  shop: string;
  name: string | null;
  /** `pending` numbers are waiting for their person to sign up; `expired` ones ran out of time. */
  status: "pending" | "expired" | "active";
  expiresAt: Date;
  signedUpAt: Date | null;
};

/** 12345678 → "1234 5678" (with a non-breaking space), easier to read out and type. */
export const formatNumber = (number: string) => `${number.slice(0, 4)}\u00a0${number.slice(4)}`;

/** Everyone with access, or with a number waiting to be used, newest first. */
export async function listEmployees() {
  const sql = await db();
  return sql<Employee[]>`
    select id, number, shop, name, expires_at, signed_up_at,
           case when signed_up_at is not null then 'active'
                when expires_at > now() then 'pending'
                else 'expired' end as status
    from employees
    where revoked_at is null
    order by created_at desc`;
}

/** Issues an employee number for a shop. It signs one person up, within two weeks. */
export async function addEmployeeNumber(shop: string) {
  if (!findLocation(shop)) throw new StaffError("Pick a shop.");
  const sql = await db();

  for (;;) {
    const number = String(randomInt(10_000_000, 100_000_000));
    const [employee] = await sql<Employee[]>`
      insert into employees (number, shop, expires_at)
      values (${number}, ${shop}, now() + make_interval(days => ${INVITE_DAYS}))
      on conflict (number) do nothing
      returning id, number, shop, name, expires_at, signed_up_at, 'pending' as status`;
    if (employee) return employee;
  }
}

/** Ends an employee's access and signs them out everywhere. Their number can't be used again. */
export async function revokeEmployee(id: string) {
  if (!UUID.test(id)) throw new StaffError("Employee not found.", 404);
  const sql = await db();

  const revoked =
    await sql`update employees set revoked_at = now() where id = ${id} and revoked_at is null returning id`;
  if (revoked.length === 0) throw new StaffError("Employee not found.", 404);
  await sql`delete from sessions where employee_id = ${id}`;
}
