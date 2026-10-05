"use client";

import { useEffect, useState } from "react";
import { isOpen } from "@/lib/hours";

export function OpenStatus() {
  const [open, setOpen] = useState<boolean>();

  useEffect(() => {
    const update = () => setOpen(isOpen());
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  if (open === undefined) return null;
  return <p className={`status ${open ? "is-open" : "is-closed"}`}>{open ? "Open now" : "Closed now"}</p>;
}
