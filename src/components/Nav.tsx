"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

const LINKS: [string, string][] = [
  ["/", "Now"],
  ["/languages/", "Languages"],
  ["/topics/", "Topics"],
  ["/backtests/", "Backtests"],
  ["/pipeline/", "Pipeline Live"],
  ["/lineage/", "Lineage"],
  ["/catalog/", "Catalog"],
  ["/report/", "Weekly report"],
  ["/method/", "Method and data"],
  ["/built/", "How it's built"],
];

type VT = { ready: Promise<void>; finished: Promise<void> };

// Three themes, in the order the button walks through them.
const NEXT: Record<string, string> = { babel: "dark", dark: "light", light: "babel" };
const LABEL: Record<string, string> = { babel: "Babel", dark: "Dark", light: "Light" };
const ICON: Record<string, string> = { babel: "babel", dark: "moon", light: "sun" };
type DocVT = Document & { startViewTransition?: (cb: () => void) => VT };

export function Nav() {
  const path = usePathname();
  const [mode, setMode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [openFor, setOpenFor] = useState(path);
  // Close the phone menu after a navigation (state derived from the path, no effect needed).
  if (openFor !== path) {
    setOpenFor(path);
    setOpen(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the theme the boot script applied
    setMode(document.documentElement.dataset.mode ?? "babel");
  }, []);

  // Theme switch: a circular reveal from the button through a view transition; a short colour
  // fade where view transitions are missing; instant under reduced motion.
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = NEXT[mode ?? "babel"] ?? "dark";
    const root = document.documentElement;
    const apply = () => {
      root.dataset.mode = next;
      try {
        localStorage.setItem("babel-mode", next);
      } catch {}
      setMode(next);
      window.dispatchEvent(new Event("babel-theme"));
    };
    const doc = document as DocVT;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return apply();
    if (!doc.startViewTransition) {
      root.classList.add("theme-fade");
      apply();
      window.setTimeout(() => root.classList.remove("theme-fade"), 450);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add("theme-vt");
    const vt = doc.startViewTransition(() => flushSync(apply));
    vt.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 560, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
    vt.finished.finally(() => root.classList.remove("theme-vt"));
  };

  return (
    <header className="top">
      <Link className="brand" href="/" aria-label="Babel Lag home">
        <Logo />
        <span className="brand-text">Babel Lag</span>
      </Link>
      <button
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen(!open)}
      >
        <span className="burger" aria-hidden="true" />
        {open ? "Close" : "Menu"}
      </button>
      <nav aria-label="Main" id="main-nav" className={open ? "open" : undefined}>
        <ul>
          {LINKS.map(([href, label]) => {
            const cur = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <li key={href}>
                <Link href={href} aria-current={cur ? "page" : undefined}>
                  {label}
                  {cur ? <span className="nav-ind" aria-hidden="true" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        className="mode"
        onClick={toggle}
        aria-label={`Colour theme: ${LABEL[mode ?? "babel"]}. Switch to ${LABEL[NEXT[mode ?? "babel"] ?? "dark"]}`}
        title="Switch theme: Babel, Dark, Light"
      >
        <span className={`mode-icon ${ICON[mode ?? "babel"] ?? "babel"}`} aria-hidden="true" />
        <span className="mode-label">{LABEL[mode ?? "babel"]}</span>
      </button>
    </header>
  );
}

// Logo direction D: four uneven floors, the top one lit. On hover the floors rebuild in turn.
export function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" width="32" height="32" className="logo">
      <rect className="ink f1" x="6" y="48" width="52" height="10" rx="1.5" />
      <rect className="ink f2" x="16" y="35" width="36" height="10" rx="1.5" />
      <rect className="ink f3" x="10" y="22" width="26" height="10" rx="1.5" opacity=".65" />
      <rect className="lit f4" x="22" y="9" width="12" height="10" rx="1.5" />
    </svg>
  );
}
