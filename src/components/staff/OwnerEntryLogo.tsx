"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TAPS = 5;
/** The longest pause between two taps before the count starts again. */
const PAUSE_MS = 1200;
/** How long the logo spins before the owner sign-in opens. */
const SPIN_MS = 600;

/**
 * The logo on the staff sign-in. Tapping it five times in a row opens the owner sign-in,
 * which has no visible link. The Owner ID is still what lets the owner in.
 */
export function OwnerEntryLogo() {
  const router = useRouter();
  const taps = useRef({ count: 0, last: 0 });
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (!spinning) return;
    const timer = setTimeout(() => router.replace("/orders/owner"), SPIN_MS);
    return () => clearTimeout(timer);
  }, [spinning, router]);

  function tap() {
    const now = Date.now();
    taps.current.count = now - taps.current.last > PAUSE_MS ? 1 : taps.current.count + 1;
    taps.current.last = now;
    if (taps.current.count >= TAPS) setSpinning(true);
  }

  return (
    <img
      className={spinning ? "staff__logo staff__logo--spin" : "staff__logo"}
      src="/logo.png"
      alt=""
      width={96}
      height={96}
      onClick={tap}
    />
  );
}
