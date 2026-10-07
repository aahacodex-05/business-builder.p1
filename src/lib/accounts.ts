import { db } from "@/lib/db";
import { StaffError } from "@/lib/errors";
import { normalizeOwnerCode } from "@/lib/owner-code";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, type Staff } from "@/lib/staff";
import { guard } from "@/lib/throttle";

const QUARTER_HOUR = 15 * 60;
const HOUR = 60 * 60;
const NUMBER_LENGTH = 8;

/** Employee numbers are typed with or without spaces. */
export const normalizeNumber = (typed: string) => typed.replace(/\D/g, "");

type Account = { id: string; name: string; shop: string };
const employee = ({ id, name, shop }: Account): Staff => ({ role: "employee", id, name, shop });

/**
 * Turns an unused employee number into an account. The number works once, so two people can't share it,
 * and a wrong, used, expired or revoked number all get the same answer.
 */
export async function signUpEmployee(fields: { number: string; name: string; password: string }, ip: string) {
  const number = normalizeNumber(fields.number);
  const name = fields.name.trim();
  const { password } = fields;

  if (number.length !== NUMBER_LENGTH)
    throw new StaffError(`Enter the ${NUMBER_LENGTH}-digit employee number you were given.`);
  if (!name || name.length > 60) throw new StaffError("Enter your name.");
  if (password.length < 8 || password.length > 200)
    throw new StaffError("Choose a password with at least 8 characters.");

  const forgive = await guard([`signup:ip:${ip}`, 10, QUARTER_HOUR], ["signup:all", 40, HOUR]);
  const sql = await db();
  const [account] = await sql<Account[]>`
    update employees
    set name = ${name}, password_hash = ${await hashPassword(password)}, signed_up_at = now()
    where number = ${number} and signed_up_at is null and revoked_at is null and expires_at > now()
    returning id, name, shop`;
  if (!account) throw new StaffError("That employee number isn't valid. Check it with the owner.");

  await forgive();
  return createSession(employee(account));
}

export async function signInEmployee(typedNumber: string, password: string, ip: string) {
  const number = normalizeNumber(typedNumber);
  const wrong = new StaffError("That employee number or password isn't right.", 401);
  if (number.length !== NUMBER_LENGTH || !password) throw wrong;

  const forgive = await guard([`login:ip:${ip}`, 20, QUARTER_HOUR], [`login:number:${number}`, 5, QUARTER_HOUR]);
  const sql = await db();
  const [account] = await sql<(Account & { passwordHash: string })[]>`
    select id, name, shop, password_hash from employees
    where number = ${number} and signed_up_at is not null and revoked_at is null`;
  if (!(await verifyPassword(password, account?.passwordHash))) throw wrong;

  await forgive();
  return createSession(employee(account));
}

/** The owner proves who they are with the Owner ID made before launch; only its hash is on the server. */
export async function signInOwner(code: string, ip: string) {
  const hash = process.env.OWNER_CODE_HASH;
  if (!hash) throw new StaffError("Owner sign-in isn't set up yet.", 503);

  const forgive = await guard([`owner:ip:${ip}`, 5, QUARTER_HOUR], ["owner:all", 10, QUARTER_HOUR]);
  if (!(await verifyPassword(normalizeOwnerCode(code), hash))) throw new StaffError("That Owner ID isn't right.", 401);

  await forgive();
  return createSession({ role: "owner" });
}
