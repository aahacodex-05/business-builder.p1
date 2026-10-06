import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-display" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Mocha Express Coffee | Portland, OR",
  description:
    "Cozy Portland coffeehouse with couches, comfortable work tables and handcrafted mochas. Three locations; order ahead for pickup.",
  icons: "/logo.png",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
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
      </body>
    </html>
  );
}
