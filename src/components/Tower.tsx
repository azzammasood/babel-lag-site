"use client";
import { useEffect, useRef, useState } from "react";
import { box, easeOut, fitCanvas, mix, onTheme, prefersReducedMotion, readTokens, rgba, shade, tint, visibleLoop, type View } from "@/lib/iso";

export type Floor = {
  lagY: number; // median lag in years: when the floor is placed (1 second = 1 year)
  size: number; // side of the square floor in world units; its area follows coverage
  log: React.ReactNode;
};

const HOLD = 6; // seconds the finished tower stands before the build replays
const WINDOW = 14; // log lines shown: the most recent arrivals
const DROP = 0.45; // seconds a new floor takes to settle
const PITCH = 0.42;

// The Babel tower on a canvas: one floor per language, placed when the clock reaches its median
// lag. Nothing is React state per frame: the clock, the count and the log are written directly,
// the loop pauses when the tower is off screen or the tab is hidden, and reduced motion draws the
// finished tower once.
export function Tower({
  floors,
  yrMax,
  label,
  intro,
  children,
}: {
  intro?: React.ReactNode;
  floors: Floor[];
  yrMax: number;
  label: string;
  children?: React.ReactNode;
}) {
  const n = floors.length;
  const canvas = useRef<HTMLCanvasElement>(null);
  const out = useRef<HTMLOutputElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const ctl = useRef({ playing: true, replay: () => {}, toggle: () => {} });
  const [paused, setPaused] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduced = prefersReducedMotion();
    let tk = readTokens();
    const fh = Math.max(1.6, Math.min(27, 540 / Math.max(1, n)));
    const gap = fh > 5 ? 1.5 : 0;
    const maxSide = Math.max(...floors.map((f) => f.size));
    const placed = new Float64Array(n).fill(-1e9);
    let t = reduced ? yrMax : 0;
    let k = reduced ? n : 0;
    let yaw = 0.6;
    let clock = 0;

    const setLog = (kk: number, newest: number) => {
      items.current.forEach((li, i) => {
        if (!li) return;
        li.hidden = i >= kk || i < kk - WINDOW;
        li.classList.toggle("new", i === newest);
      });
      if (count.current) count.current.textContent = `${kk} of ${n} floors built`;
      if (caption.current) {
        caption.current.textContent =
          kk >= n ? "The last floors placed (longest waits)" : "Latest floors placed";
      }
    };

    const draw = () => {
      const [w, h] = fitCanvas(c, ctx);
      ctx.clearRect(0, 0, w, h);
      const half = (maxSide / 2) * Math.SQRT2;
      const towerH = n * fh;
      const sc = Math.min((w - 32) / (2 * half), (h - 40) / (towerH * Math.cos(PITCH) + 2 * half * Math.sin(PITCH)));
      const v: View = { cx: w / 2, cy: h - 20 - half * sc * Math.sin(PITCH), sc, yaw, pitch: PITCH };
      // ground shadow
      const g = ctx.createRadialGradient(v.cx, v.cy, 0, v.cx, v.cy, half * sc * 1.15);
      g.addColorStop(0, rgba(tk.text, 0.22));
      g.addColorStop(1, rgba(tk.text, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(v.cx, v.cy, half * sc * 1.15, half * sc * 1.15 * Math.sin(PITCH), 0, 0, Math.PI * 2);
      ctx.fill();

      const base = mix(tk.surface, tk.accent, 0.38);
      const top = rgba(tint(base, 0.12));
      const sideA = rgba(shade(base, 0.16));
      const sideB = rgba(shade(base, 0.3));
      const hot = tk.accent;
      for (let i = 0; i < k; i++) {
        const f = floors[i]!;
        const age = (clock - placed[i]!) / DROP;
        const drop = reduced ? 0 : (1 - easeOut(age)) * 160;
        const fresh = !reduced && age < 2.4;
        box(
          ctx,
          v,
          0,
          0,
          f.size,
          f.size,
          i * fh + drop,
          Math.max(0.8, fh - gap),
          fresh ? rgba(tint(hot, 0.1)) : top,
          fresh ? rgba(shade(hot, 0.12)) : sideA,
          fresh ? rgba(shade(hot, 0.28)) : sideB,
        );
      }
    };

    const frame = (dt: number) => {
      if (!ctl.current.playing) return false;
      clock += dt;
      t += dt;
      if (t > yrMax + HOLD) {
        t = 0;
        k = 0;
        placed.fill(-1e9);
      }
      const shown = Math.min(t, yrMax);
      let kk = k;
      while (kk < n && shown >= floors[kk]!.lagY) {
        placed[kk] = clock;
        kk++;
      }
      if (kk !== k) {
        k = kk;
        setLog(k, k < n ? k - 1 : -1);
      }
      yaw += dt * 0.12;
      if (out.current) out.current.textContent = `Year ${shown.toFixed(1)}`;
      draw();
      return true;
    };

    const ro = new ResizeObserver(() => draw());
    ro.observe(c);
    const offTheme = onTheme(() => {
      tk = readTokens();
      draw();
    });
    if (reduced) {
      setLog(n, -1);
      draw();
      return () => {
        ro.disconnect();
        offTheme();
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- motion is only known in the browser
    setMoving(true);
    setLog(0, -1);
    const loop = visibleLoop(c, frame);
    ctl.current.replay = () => {
      t = 0;
      k = 0;
      placed.fill(-1e9);
      setLog(0, -1);
      ctl.current.playing = true;
      loop.start();
    };
    ctl.current.toggle = () => {
      ctl.current.playing = !ctl.current.playing;
      if (ctl.current.playing) loop.start();
    };
    loop.start();
    return () => {
      loop.stop();
      ro.disconnect();
      offTheme();
    };
  }, [floors, yrMax, n]);

  const replay = () => {
    ctl.current.replay();
    setPaused(false);
  };
  const toggle = () => {
    ctl.current.toggle();
    setPaused(!ctl.current.playing);
  };

  return (
    <div className="tower-hero">
      <div className="th-text">
      {intro}
      <div className="ctl" data-static="">
        {moving ? (
          <>
            <button type="button" onClick={replay}>
              Replay
            </button>
            <button type="button" onClick={toggle} aria-pressed={paused}>
              {paused ? "Play" : "Pause"}
            </button>
          </>
        ) : null}
        <output ref={out}>Year {yrMax.toFixed(1)}</output>
        <span>
          <span ref={count}>
            {n} of {n} floors built
          </span>{" "}
          · 1 second = 1 year of median lag
        </span>
      </div>
        <div className="logbox">
          <p className="small muted" style={{ margin: "0 0 6px" }} ref={caption}>
            The last floors placed (longest waits)
          </p>
          <ol className="log" aria-label="Most recent floors, newest first">
            {floors
              .map((f, i) => (
                <li
                  key={i}
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  hidden={i < n - WINDOW}
                  className="in"
                >
                  {f.log}
                </li>
              ))
              .reverse()}
          </ol>
          {children}
        </div>
      </div>
      <div className="stage tall">
        <canvas ref={canvas} role="img" aria-label={label} />
      </div>
    </div>
  );
}
