import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Inter } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Mocha Express Coffee | Portland, OR",
  description:
    "Handcrafted espresso, mochas and fresh food at three locations across the greater Portland area. Order online for pickup.",
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
            <img src="/logo.png" alt="Mocha Express Coffee" width={56} height={56} />
            <p>© {new Date().getFullYear()} Mocha Express Coffee. Greater Portland, Oregon.</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
