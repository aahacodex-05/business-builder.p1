import Link from "next/link";
import { login } from "../actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <>
      <h1>Log in</h1>
      <AuthForm action={login} submitLabel="Log in" />
      <p className="muted">
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </>
  );
}
