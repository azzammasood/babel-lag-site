"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS: [string, string][] = [
  ["/", "Now"],
  ["/languages/", "Languages"],
  ["/topics/", "Topics"],
  ["/backtests/", "Backtests"],
  ["/pipeline/", "Pipeline Live"],
  ["/lineage/", "Lineage"],
  ["/catalog/", "Catalog"],
  ["/method/", "Method and data"],
  ["/built/", "How it's built"],
];

export function Nav() {
  const path = usePathname();
  const [mode, setMode] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the mode the boot script applied
    setMode(
      document.documentElement.dataset.mode ??
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    );
  }, []);
  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    document.documentElement.dataset.mode = next;
    try {
      localStorage.setItem("babel-mode", next);
    } catch {}
    setMode(next);
  };
  return (
    <header className="top">
      <Link className="brand" href="/" aria-label="Babel Lag home">
        <Logo />
        <span>Babel Lag</span>
      </Link>
      <nav aria-label="Main">
        <ul>
          {LINKS.map(([href, label]) => {
            const cur = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <li key={href}>
                <Link href={href} aria-current={cur ? "page" : undefined}>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button type="button" className="mode" onClick={toggle} aria-label="Switch colour mode">
        {mode === "dark" ? "Light" : "Dark"}
      </button>
    </header>
  );
}

// Logo direction D: four uneven floors, the top one lit.
export function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" width="32" height="32">
      <rect className="ink" x="6" y="48" width="52" height="10" rx="1.5" />
      <rect className="ink" x="16" y="35" width="36" height="10" rx="1.5" />
      <rect className="ink" x="10" y="22" width="26" height="10" rx="1.5" opacity=".65" />
      <rect className="lit" x="22" y="9" width="12" height="10" rx="1.5" />
    </svg>
  );
}
