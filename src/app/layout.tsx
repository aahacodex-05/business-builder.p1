import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "./actions/auth";
import { getUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Business Builder",
  description: "Your account, deadlines and AI assistant.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="en">
      <body>
        <header className="top">
          <div className="wrap">
            <a className="logo" href="/">THE BUSINESS BUILDER</a>
            <nav className="nav" aria-label="Account">
              {user ? (
                <>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/assistant">AI assistant</Link>
                  <form action={logout}>
                    <button type="submit">Log out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Log in</Link>
                  <Link href="/signup">Sign up</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
