import Link from "next/link";
import { markDone } from "../actions/deadlines";
import { openBillingPortal, startCheckout } from "../actions/billing";
import { DeadlineForm } from "@/components/DeadlineForm";
import { requireUser } from "@/lib/auth";
import { listDeadlines } from "@/lib/deadlines";
import { isPaid } from "@/lib/plan";
import { formatDue } from "@/lib/reminders";

export default async function DashboardPage() {
  const user = await requireUser();
  const paid = isPaid(user);
  const deadlines = await listDeadlines(user.id);

  return (
    <>
      <h1>Hi, {user.name}</h1>

      <section className="card">
        <h2>Your plan</h2>
        {paid ? (
          <>
            <p>Active. Your AI assistant and deadline alerts are on.</p>
            <Link className="btn" href="/assistant">Open AI assistant</Link>{" "}
            <form action={openBillingPortal} style={{ display: "inline" }}>
              <button className="btn ghost">Manage billing</button>
            </form>
          </>
        ) : (
          <>
            <p>Subscribe to unlock the AI assistant and email alerts 7 days, 1 day and 1 hour before every deadline. The AI is included in your plan, with nothing extra to buy.</p>
            <form action={startCheckout}>
              <button className="btn">Subscribe</button>
            </form>
          </>
        )}
      </section>

      <section className="card">
        <h2>Deadlines</h2>
        {deadlines.length === 0 ? (
          <p className="muted">No open deadlines.</p>
        ) : (
          <ul className="list">
            {deadlines.map((d) => (
              <li key={d.id}>
                <span>
                  <strong>{d.title}</strong>
                  <br />
                  <span className="muted">{formatDue(d.dueAt, user.timeZone)}</span>
                </span>
                <form action={markDone.bind(null, d.id)}>
                  <button className="btn ghost">Done</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Add a deadline</h2>
        <DeadlineForm />
      </section>
    </>
  );
}
