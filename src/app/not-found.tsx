import Link from "next/link";

export const metadata = { title: "Page not found | Mocha Express Coffee" };

export default function NotFound() {
  return (
    <main className="confirm">
      <img src="/logo.png" alt="" width={120} height={120} />
      <h1>We can't find that page</h1>
      <p>The link may be old or mistyped. The menu is a good place to start.</p>
      <Link className="btn" href="/menu">
        See the menu
      </Link>
    </main>
  );
}
