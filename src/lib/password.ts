import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// OWASP's scrypt settings (N = 2^15, r = 8, p = 3). They're stored with each hash, so they can be raised later.
const COST = { N: 2 ** 15, r: 8, p: 3 };
const KEY_LENGTH = 32;

/** Stands in for a missing hash, so unknown accounts take as long to check as real ones. */
const DECOY = ["scrypt", COST.N, COST.r, COST.p, "A".repeat(22), "A".repeat(43)].join(":");

const derive = (secret: string, salt: Buffer, { N, r, p }: typeof COST) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(secret, salt, KEY_LENGTH, { N, r, p, maxmem: 256 * N * r }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );

/** `scrypt:N:r:p:salt:key`. Colons rather than `$`, so the value is safe in .env files. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST);
  return ["scrypt", COST.N, COST.r, COST.p, salt.toString("base64url"), key.toString("base64url")].join(":");
}

export async function verifyPassword(password: string, stored?: string | null) {
  const [, N, r, p, salt, key] = (stored ?? DECOY).split(":");
  const actual = await derive(password, Buffer.from(salt, "base64url"), { N: Number(N), r: Number(r), p: Number(p) });
  const expected = Buffer.from(key, "base64url");
  return Boolean(stored) && actual.length === expected.length && timingSafeEqual(actual, expected);
}
