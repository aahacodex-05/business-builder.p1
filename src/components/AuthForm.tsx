"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";

type Props = {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  submitLabel: string;
  withName?: boolean;
};

export function AuthForm({ action, submitLabel, withName }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form
      className="stack"
      action={(form) => {
        form.set("timeZone", Intl.DateTimeFormat().resolvedOptions().timeZone);
        formAction(form);
      }}
    >
      {withName && (
        <label>
          Name
          <input name="name" autoComplete="name" required />
        </label>
      )}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete={withName ? "new-password" : "current-password"}
          minLength={withName ? 8 : undefined}
          required
        />
      </label>
      {state?.error && <p className="error">{state.error}</p>}
      <button className="btn" disabled={pending}>
        {submitLabel}
      </button>
    </form>
  );
}

