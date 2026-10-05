"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function Header() {
  const { count, setOpen } = useCart();

  return (
    <header className="nav">
      <Link className="nav__brand" href="/">
        <img src="/logo.png" alt="" width={40} height={40} />
        <span>Mocha Express</span>
      </Link>
      <nav className="nav__links" aria-label="Main">
        <a href="/#menu">Menu</a>
        <a href="/#locations">Locations</a>
        <a href="/#about">About</a>
      </nav>
      <button className="btn btn--small" onClick={() => setOpen(true)}>
        Cart{count > 0 && <span className="badge">{count}</span>}
      </button>
    </header>
  );
}
