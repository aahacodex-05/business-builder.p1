"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const REFRESH_MS = 15_000;

/** Keeps the order board current and, once switched on, chimes when a new order arrives. */
export function OrderAlerts({ waitingIds }: { waitingIds: string[] }) {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef<AudioContext>(undefined);
  const seen = useRef(new Set(waitingIds));

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    const isNew = waitingIds.some((id) => !seen.current.has(id));
    waitingIds.forEach((id) => seen.current.add(id));
    if (isNew && soundOn && audio.current) chime(audio.current);
  }, [waitingIds, soundOn]);

  function toggleSound() {
    audio.current ??= new AudioContext();
    if (!soundOn) chime(audio.current);
    setSoundOn(!soundOn);
  }

  return (
    <button className="staff__sound" onClick={toggleSound} aria-pressed={soundOn}>
      {soundOn ? "Sound on" : "Turn sound on"}
    </button>
  );
}

function chime(context: AudioContext) {
  const now = context.currentTime;
  [660, 880].forEach((frequency, i) => {
    const tone = context.createOscillator();
    const volume = context.createGain();
    tone.frequency.value = frequency;
    volume.gain.setValueAtTime(0.25, now + i * 0.18);
    volume.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.4);
    tone.connect(volume).connect(context.destination);
    tone.start(now + i * 0.18);
    tone.stop(now + i * 0.18 + 0.4);
  });
}
