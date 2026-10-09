import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-display" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Mocha Express Coffee | Portland, OR",
  description:
    "Cozy Portland coffeehouse with big armchairs, comfortable work tables and handcrafted mochas. Three locations; order ahead for pickup.",
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
