"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { Icon } from "./Icon";

export function Header() {
  const { count, setOpen } = useCart();

  return (
    <header className="nav">
      <Link className="nav__brand" href="/" aria-label="Mocha Express, home">
        <img src="/logo.png" alt="" width={40} height={40} />
        <span>Mocha Express</span>
      </Link>
      <nav className="nav__links" aria-label="Main">
        <Link className="nav__space" href="/#space">
          The space
        </Link>
        <Link href="/menu">Menu</Link>
        <Link href="/#locations">Locations</Link>
      </nav>
      <button className="cart-btn" onClick={() => setOpen(true)} aria-label={`Cart (${count})`}>
        <Icon name="bag" />
        {count > 0 && <span className="badge">{count}</span>}
      </button>
    </header>
  );
}
