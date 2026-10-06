import Link from "next/link";
import { SignIn } from "@/components/staff/SignIn";
import { LOCATIONS } from "@/data/locations";
import { isStaff } from "@/lib/staff";
import { signOut } from "./actions";

export default async function StaffHome() {
  if (!(await isStaff())) return <SignIn />;

  return (
    <div className="staff__home">
      <img src="/logo.png" alt="" width={96} height={96} />
      <h1>Which shop is this tablet for?</h1>
      <ul>
        {LOCATIONS.map(({ id, name }) => (
          <li key={id}>
            <Link className="btn btn--block" href={`/orders/${id}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
      <form action={signOut}>
        <button className="staff__link">Sign out</button>
      </form>
    </div>
  );
}
