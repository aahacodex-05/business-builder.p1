import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/staff/AuthForm";
import { webStaff } from "@/lib/staff";
import { signIn } from "./actions";

export default async function StaffHome() {
  const staff = await webStaff();
  if (staff) redirect(staff.role === "owner" ? "/orders/owner" : `/orders/${staff.shop}`);

  return (
    <AuthForm
      title="Staff sign-in"
      submit="Sign in"
      action={signIn}
      fields={[
        { name: "number", label: "Employee number", inputMode: "numeric", autoComplete: "username" },
        { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
      ]}
    >
      <p>
        New here? <Link href="/orders/signup">Sign up</Link>
      </p>
      <Link className="staff__link" href="/orders/owner">
        Owner sign-in
      </Link>
    </AuthForm>
  );
}
