"use client";

import { useEffect, useState } from "react";
import { isOpen, type Hours } from "@/lib/hours";

export function OpenStatus({ hours }: { hours: Hours }) {
  const [open, setOpen] = useState<boolean>();

  useEffect(() => {
    const update = () => setOpen(isOpen(hours));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [hours]);

  if (open === undefined) return null;
  return <p className={`status ${open ? "is-open" : "is-closed"}`}>{open ? "Open now" : "Closed now"}</p>;
}
