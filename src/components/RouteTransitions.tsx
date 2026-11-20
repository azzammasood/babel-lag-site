"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type VT = { finished: Promise<void> };
type DocVT = Document & { startViewTransition?: (cb: () => Promise<void>) => VT };

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Animated page changes with the View Transitions API: internal link clicks are routed through
// document.startViewTransition, and the new page is captured once its route has rendered.
// Without the API (or with reduced motion) links behave as plain Next links, and CSS plays a short
// entry animation on the page instead.
export function RouteTransitions() {
  const router = useRouter();
  const path = usePathname();
  const done = useRef<(() => void) | null>(null);

  useEffect(() => {
    done.current?.();
    done.current = null;
  }, [path]);

  useEffect(() => {
    const doc = document as DocVT;
    if (!doc.startViewTransition) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (BASE && !url.pathname.startsWith(BASE)) return;
      if (url.pathname === location.pathname) return; // same page (or an in-page anchor)
      e.preventDefault();
      const href = url.pathname.slice(BASE.length) + url.search + url.hash;
      doc.startViewTransition!(
        () =>
          new Promise<void>((resolve) => {
            done.current = resolve;
            window.setTimeout(resolve, 900); // never hold the old page if the route does not change
            router.push(href || "/");
          }),
      );
    };
    // Capture phase: runs before Next's Link handler, which then sees defaultPrevented and stands down.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
