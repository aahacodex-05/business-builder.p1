"use client";

import { useActionState } from "react";
import { addDeadline } from "@/app/actions/deadlines";

export function DeadlineForm() {
  const [state, formAction, pending] = useActionState(addDeadline, undefined);
  return (
    <form
      className="stack"
      action={(form) => {
        // datetime-local has no time zone; send the browser's interpretation as ISO.
        const local = String(form.get("dueAt") ?? "");
        if (local) form.set("dueAt", new Date(local).toISOString());
        formAction(form);
      }}
    >
      <label>
        What&apos;s due
        <input name="title" required maxLength={200} />
      </label>
      <label>
        Due
        <input name="dueAt" type="datetime-local" required />
      </label>
      <label>
        Notes (optional)
        <textarea name="notes" rows={2} maxLength={2000} />
      </label>
      {state?.error && <p className="error">{state.error}</p>}
      <button className="btn" disabled={pending}>
        Add deadline
      </button>
    </form>
  );
}
