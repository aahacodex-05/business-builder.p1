import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Orders | Mocha Express Coffee",
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <main className="staff">{children}</main>;
}
