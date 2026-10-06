"use client";

import { useActionState } from "react";
import { signIn } from "@/app/(staff)/orders/actions";

export function SignIn() {
  const [error, action, pending] = useActionState(signIn, undefined);

  return (
    <form className="staff__signin" action={action}>
      <img src="/logo.png" alt="" width={96} height={96} />
      <h1>Staff orders</h1>
      <label>
        Passcode
        <input name="passcode" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn--block" disabled={pending}>
        {pending ? "Checking…" : "Open orders"}
      </button>
    </form>
  );
}
