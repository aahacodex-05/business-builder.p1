"use client";

import { useState, useTransition, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { OwnerEntryLogo } from "./OwnerEntryLogo";

type Field = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "autoComplete" | "autoCapitalize" | "spellCheck"
> & { name: string; label: string; hint?: string };

type Props = {
  title: string;
  submit: string;
  fields: Field[];
  /** Answers with the message to show, or sends the person on when it works. */
  action: (form: FormData) => Promise<string | undefined>;
  /** Makes the logo a hidden way into the owner sign-in (five taps). */
  ownerEntry?: boolean;
  children?: ReactNode;
};

/** The sign-in, sign-up and owner forms. Typed values stay put when something is wrong. */
export function AuthForm({ title, submit, fields, action, ownerEntry, children }: Props) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => setError(await action(form)));
  }

  return (
    <form className="staff__signin" onSubmit={onSubmit}>
      {ownerEntry ? <OwnerEntryLogo /> : <img src="/logo.png" alt="" width={96} height={96} />}
      <h1>{title}</h1>
      {fields.map(({ label, hint, ...input }, i) => (
        <label key={input.name}>
          {label}
          <input required autoFocus={i === 0} {...input} />
          {hint && <small>{hint}</small>}
        </label>
      ))}
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn--block" disabled={pending}>
        {pending ? "One moment…" : submit}
      </button>
      {children}
    </form>
  );
}
