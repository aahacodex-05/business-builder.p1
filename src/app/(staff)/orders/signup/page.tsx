import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/staff/AuthForm";
import { webStaff } from "@/lib/staff";
import { signUp } from "../actions";

export default async function SignUp() {
  if (await webStaff()) redirect("/orders");

  return (
    <AuthForm
      title="Employee sign-up"
      submit="Create my account"
      action={signUp}
      fields={[
        {
          name: "number",
          label: "Employee number",
          hint: "The 8 digits your manager gave you.",
          inputMode: "numeric",
          autoComplete: "username",
        },
        { name: "name", label: "Your name", autoComplete: "name" },
        {
          name: "password",
          label: "Password",
          hint: "At least 8 characters.",
          type: "password",
          autoComplete: "new-password",
        },
        { name: "confirm", label: "Password again", type: "password", autoComplete: "new-password" },
      ]}
    >
      <p>
        Already have an account? <Link href="/orders">Sign in</Link>
      </p>
    </AuthForm>
  );
}
