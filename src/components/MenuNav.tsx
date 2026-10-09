"use client";

import { useEffect, useRef, useState } from "react";

type Section = { id: string; label: string };

const distanceFromTop = (id: string) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity;

/** Links to each menu section, highlighting the one being read. */
export function MenuNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0].id);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
      const current = atBottom ? sections.at(-1) : sections.findLast(({ id }) => distanceFromTop(id) < window.innerHeight / 3);
      setActive((current ?? sections[0]).id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [sections]);

  // The links scroll sideways; keep the active one in view.
  useEffect(() => {
    const bar = nav.current;
    const link = bar?.querySelector<HTMLElement>(".is-active");
    if (bar && link && bar.scrollWidth > bar.clientWidth) {
      bar.scrollTo({ left: link.offsetLeft - (bar.clientWidth - link.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [active]);

  return (
    <nav ref={nav} className="menu-nav" aria-label="Menu sections">
      {sections.map(({ id, label }) => (
        <a key={id} href={`#${id}`} className={id === active ? "is-active" : undefined} aria-current={id === active}>
          {label}
        </a>
      ))}
    </nav>
  );
}
