import { randomInt } from "node:crypto";

// Crockford base32: no I, L, O or U, so a code read off a card can't be mistyped.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** A fresh Owner ID: 16 characters (80 bits), written XXXX-XXXX-XXXX-XXXX. */
export function newOwnerCode() {
  const group = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return Array.from({ length: 4 }, group).join("-");
}

/** What was typed, ignoring case, spaces and dashes, with O and I/L read as the digits they look like. */
export const normalizeOwnerCode = (typed: string) =>
  typed
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
