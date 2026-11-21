"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { box, easeOut, fitCanvas, mix, readTokens, rgba, shade, tint, type View } from "@/lib/iso";

export const INTRO_SEEN = "babel-intro-seen";
const FH = 26; // block height in world units
const STEP_GAP = 0.32; // seconds between blocks while the tower stacks
const PITCH = 0.42;
const NAT_FONT =
  '"Noto Sans", "Nirmala UI", "Ebrima", "Noto Sans Devanagari", "Noto Sans Bengali", "Noto Sans Ethiopic", "Noto Naskh Arabic", system-ui, sans-serif';

export type IntroBlock = { name: string; size: number };

// The landing intro, reader-paced: one first article -> languages stacking into a tower, each in
// its own script, in the order knowledge reaches them -> the whole tower and the numbers. Shown
// once per browser session, only when the page was opened on the home page (the boot script adds
// `intro` to <html> before paint); never under reduced motion. Escape or "Skip intro" ends it.
export function Intro({ steps, blocks }: { steps: React.ReactNode[]; blocks: IntroBlock[] }) {
  const [show, setShow] = useState(false);
  const [at, setAt] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the boot script decided before paint
    if (document.documentElement.classList.contains("intro")) setShow(true);
  }, []);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    try {
      sessionStorage.setItem(INTRO_SEEN, "1");
    } catch {}
    window.setTimeout(() => {
      document.documentElement.classList.remove("intro");
      window.dispatchEvent(new Event("babel-intro-done"));
      setShow(false);
    }, 650);
  };

  useEffect(() => {
    stepRef.current = at;
    if (show) next.current?.focus({ preventScroll: true });
  }, [at, show]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finish only reads stable refs and setters
  }, [show]);

  // The intro scene: a canvas loop that runs only while the intro is open.
  useEffect(() => {
    if (!show) return;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const tk = readTokens();
    const n = blocks.length;
    const maxSide = Math.max(...blocks.map((b) => b.size));
    const half = (maxSide / 2) * Math.SQRT2;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let stackT = 0; // seconds since the stacking step began
    let pull = 0;
    let yaw = 0.5;
    const frame = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      clock += dt;
      yaw += dt * 0.18;
      const s = stepRef.current;
      if (s >= 1) stackT += dt;
      if (s >= 2) pull = Math.min(1, pull + dt / 1.6);
      const [w, h] = fitCanvas(c, ctx);
      ctx.clearRect(0, 0, w, h);
      // The scene lives between the narration (top) and the buttons (bottom), always fully in view.
      const textEl = c.parentElement?.querySelector(".intro-text .st.on");
      const pagerEl = c.parentElement?.querySelector(".pager");
      const top = (textEl ? textEl.getBoundingClientRect().bottom : h * 0.3) + 24;
      const bottom = (pagerEl ? pagerEl.getBoundingClientRect().top : h - 140) - 16;
      const room = Math.max(120, bottom - top);
      const towerH = n * FH;
      const fit = Math.min((w * 0.36) / (2 * half), room / (towerH * Math.cos(PITCH) + 2 * half * Math.sin(PITCH)));
      const e = easeOut(pull);
      const sc = fit * (1 + 0.12 * e);
      const v: View = { cx: w / 2, cy: bottom - half * sc * Math.sin(PITCH), sc, yaw, pitch: PITCH };
      const base = mix(tk.surface, tk.accent, 0.42);
      const outline = rgba(shade(base, 0.5), 0.9);

      // Step 0: the first article, a single glowing block.
      if (s === 0 || stackT < 0.4) {
        const glow = 0.6 + 0.4 * Math.sin(clock * 3);
        const p = v.cy - 60 * fit;
        const g = ctx.createRadialGradient(v.cx, p, 0, v.cx, p, 90 * sc + 40);
        g.addColorStop(0, rgba(tk.accent, 0.45 * glow));
        g.addColorStop(1, rgba(tk.accent, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        const fade = s === 0 ? 1 : 1 - stackT / 0.4;
        ctx.globalAlpha = Math.max(0, fade);
        box(ctx, v, 0, 0, 60, 60, 30, 60, rgba(tint(tk.accent, 0.2)), rgba(shade(tk.accent, 0.1)), rgba(shade(tk.accent, 0.3)), outline);
        ctx.globalAlpha = 1;
      }

      // Steps 1 and 2: languages stack, in the order a new topic reaches them.
      const shown = s >= 1 ? Math.min(n, Math.floor(stackT / STEP_GAP)) : 0;
      ctx.font = `600 ${Math.max(12, Math.min(18, 15 * sc + 6))}px ${NAT_FONT}`;
      ctx.textBaseline = "middle";
      for (let i = 0; i < shown; i++) {
        const b = blocks[i]!;
        const age = (stackT - i * STEP_GAP) / 0.45;
        const drop = (1 - easeOut(age)) * FH * 5;
        const col = i % 2 ? tint(base, 0.1) : base;
        box(ctx, v, 0, 0, b.size, b.size, i * FH + drop, FH - 2, rgba(tint(col, 0.14)), rgba(shade(col, 0.14)), rgba(shade(col, 0.3)), outline);
      }
      // labels after the blocks, so no block covers a name
      // Names alternate sides so neighbouring floors do not collide.
      for (let i = 0; i < shown; i++) {
        const b = blocks[i]!;
        const age = Math.min(1, (stackT - i * STEP_GAP) / 0.45);
        const y = v.cy - (i * FH + FH / 2) * sc * Math.cos(PITCH);
        const right = i % 2 === 0;
        const reach = (b.size / 2) * Math.SQRT2 * sc + 16;
        const x = right ? v.cx + reach : v.cx - reach;
        ctx.globalAlpha = age;
        ctx.fillStyle = rgba(tk.text);
        ctx.textAlign = right ? "left" : "right";
        ctx.fillText(b.name, x, y);
        ctx.fillStyle = rgba(tk.muted, 0.7);
        ctx.fillRect(right ? x - 11 : x + 4, y, 7, 1);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [show, blocks]);

  if (!show) return null;
  const lastStep = at >= steps.length - 1;
  return createPortal(
    <div
      id="intro"
      className={leaving ? "done" : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-step"
    >
      <canvas ref={canvas} aria-hidden="true" />
      <div className="intro-text" id="intro-step" aria-live="polite">
        {steps.map((s, i) => (
          <div key={i} className={`st${i === at ? " on" : ""}`} hidden={i !== at}>
            {s}
          </div>
        ))}
      </div>
      <div className="pager">
        <div className="dots" aria-hidden="true">
          {steps.map((_, i) => (
            <i key={i} className={i <= at ? "on" : undefined} />
          ))}
        </div>
        <button ref={next} type="button" className="next" onClick={() => (lastStep ? finish() : setAt(at + 1))}>
          {lastStep ? "Enter the tower" : "Continue"}
        </button>
        <button type="button" className="skip" onClick={finish}>
          Skip intro
        </button>
      </div>
    </div>,
    document.body,
  );
}
