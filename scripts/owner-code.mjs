// Makes a new Owner ID and the hash the site checks it against. Run it with: npm run owner-code
import { newOwnerCode, normalizeOwnerCode } from "../src/lib/owner-code.ts";
import { hashPassword } from "../src/lib/password.ts";

const code = newOwnerCode();

console.log(`
Owner ID. Give it to the owner and keep it private; it can't be looked up later:

  ${code}

Set this in the site's environment variables (never in the repo):

  OWNER_CODE_HASH=${await hashPassword(normalizeOwnerCode(code))}
`);
