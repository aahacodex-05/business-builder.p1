import type { ReactNode } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";
import { CartProvider } from "@/lib/cart";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Header />
      {children}
      <CartDrawer />
      <footer className="footer">
        <img src="/logo.png" alt="" width={64} height={64} />
        <strong>Mocha Express Coffee</strong>
        <p>Greater Portland, Oregon · © {new Date().getFullYear()}</p>
      </footer>
    </CartProvider>
  );
}
