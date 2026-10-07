import Link from "next/link";
import { AuthForm } from "@/components/staff/AuthForm";
import { LOCATIONS, findLocation } from "@/data/locations";
import { formatDate } from "@/lib/hours";
import { formatNumber, listEmployees, type Employee } from "@/lib/employees";
import { webStaff } from "@/lib/staff";
import { addEmployee, ownerSignIn, revokeEmployee, signOut } from "../actions";

export default async function Owner() {
  if ((await webStaff())?.role !== "owner") {
    return (
      <AuthForm
        title="Owner sign-in"
        submit="Sign in"
        action={ownerSignIn}
        fields={[
          { name: "code", label: "Owner ID", autoComplete: "off", autoCapitalize: "characters", spellCheck: false },
        ]}
      >
        <Link className="staff__link" href="/orders">
          Back to staff sign-in
        </Link>
      </AuthForm>
    );
  }

  const employees = await listEmployees();

  return (
    <div className="staff__board">
      <header className="staff__head">
        <div>
          <p className="eyebrow">Mocha Express</p>
          <h1>Owner</h1>
        </div>
        <form action={signOut}>
          <button className="staff__link">Sign out</button>
        </form>
      </header>

      <section>
        <h2>Shop order screens</h2>
        <ul className="staff__shops">
          {LOCATIONS.map(({ id, name }) => (
            <li key={id}>
              <Link className="btn" href={`/orders/${id}`}>
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Add an employee</h2>
        <form className="staff__add" action={addEmployee}>
          <label>
            Shop
            <select name="shop" required>
              {LOCATIONS.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn">Get an employee number</button>
        </form>
        <p className="fine-print">
          Give the number to your new hire. They use it once at the Staff link to sign up, within 14 days.
        </p>
      </section>

      <section>
        <h2>Team</h2>
        {employees.length === 0 ? (
          <p className="staff__empty">No one yet. Get an employee number to add your first person.</p>
        ) : (
          <ul className="team">
            {employees.map((employee) => (
              <TeamMember key={employee.id} employee={employee} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TeamMember({ employee }: { employee: Employee }) {
  const shop = findLocation(employee.shop)?.name;
  const number = formatNumber(employee.number);

  return (
    <li className="team__member">
      {employee.status === "active" ? (
        <div>
          <strong>{employee.name}</strong>
          <span>
            {shop} · number {number}
          </span>
        </div>
      ) : (
        <div>
          <strong className="team__number">{number}</strong>
          <span>
            {shop} ·{" "}
            {employee.status === "pending"
              ? `waiting to sign up, expires ${formatDate(employee.expiresAt)}`
              : "expired"}
          </span>
        </div>
      )}
      <form action={revokeEmployee.bind(null, employee.id)}>
        <button className="staff__link">{employee.status === "active" ? "Remove access" : "Cancel number"}</button>
      </form>
    </li>
  );
}
