import Link from "next/link";
import { signup } from "../actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <>
      <h1>Create your account</h1>
      <AuthForm action={signup} submitLabel="Create account" withName />
      <p className="muted">
        Already have one? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}
