"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  box,
  easeOut,
  fitCanvas,
  mix,
  onTheme,
  prefersReducedMotion,
  readTokens,
  rgba,
  shade,
  tint,
  visibleLoop,
  type View,
} from "@/lib/iso";

export type Floor = {
  lagY: number; // median lag in years: when the floor is placed (1 second = 1 year)
  size: number; // side of the square floor in world units; its area follows coverage
  log: React.ReactNode; // the line in the "latest floors" list
  info: React.ReactNode; // shown when the floor is pointed at
};

const WINDOW = 14; // log lines shown: the most recent arrivals
const FH = 10; // floor height in world units: thick enough to read while the camera follows
const FH_END = 4.5; // floors settle to this height as the camera pulls back, so the whole tower reads
const DROP = 0.5; // seconds a new floor takes to settle
const PULLBACK = 2.6; // seconds of the closing pull-back to the whole tower
const PITCH = 0.42;
const SPIN = 0.12; // radians per second while it builds

// The Babel tower on a canvas: one floor per language, placed when the clock reaches its median
// lag. The camera rises with the newest floor, then pulls back to show the whole tower once, and
// stops. Nothing is React state per frame: the clock, the count and the log are written directly;
// the loop pauses off screen and in hidden tabs; reduced motion draws the finished tower once.
// Pointing at the tower opens a short explanation and names the floor under the pointer.
export function Tower({
  floors,
  yrMax,
  label,
  intro,
  explain,
  children,
}: {
  floors: Floor[];
  yrMax: number;
  label: string;
  intro?: React.ReactNode;
  explain: React.ReactNode;
  children?: React.ReactNode;
}) {
  const n = floors.length;
  const popId = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const out = useRef<HTMLOutputElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const api = useRef<{
    playing: boolean;
    replay: () => void;
    toggle: () => void;
    pick: (x: number, y: number) => number | null;
    highlight: (i: number | null) => void;
  }>({ playing: false, replay: () => {}, toggle: () => {}, pick: () => null, highlight: () => {} });
  const [paused, setPaused] = useState(false);
  const [moving, setMoving] = useState(false);
  const [finished, setFinished] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const [over, setOver] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduced = prefersReducedMotion();
    let tk = readTokens();
    const maxSide = Math.max(...floors.map((f) => f.size));
    const half = (maxSide / 2) * Math.SQRT2;
    const placed = new Float64Array(n).fill(-1e9);
    let t = 0; // years on the clock
    let k = 0; // floors built
    let yaw = 0.6;
    let clock = 0;
    let pull = 0; // 0..1 pull-back after the last floor
    let camY = -1;
    let hot: number | null = null;
    let view: View | null = null;
    let fhNow = FH;
    let done = reduced;

    const setLog = (kk: number) => {
      items.current.forEach((li, i) => {
        if (!li) return;
        li.hidden = i >= kk || i < kk - WINDOW;
        li.classList.toggle("new", kk < n && i === kk - 1);
      });
      if (count.current) count.current.textContent = `${kk} of ${n} floors built`;
      if (caption.current) {
        caption.current.textContent = kk >= n ? "The last floors placed (longest waits)" : "Latest floors placed";
      }
    };

    const views = (w: number, h: number) => {
      const scW = Math.min(1.6, (w - 40) / (2 * half));
      const scAll = Math.min(scW, (h - 48) / (n * FH_END * Math.cos(PITCH) + 2 * half * Math.sin(PITCH)));
      return { scW, scAll };
    };

    const draw = () => {
      const [w, h] = fitCanvas(c, ctx);
      ctx.clearRect(0, 0, w, h);
      const { scW, scAll } = views(w, h);
      const e = done ? 1 : easeOut(pull);
      const sc = scW + (scAll - scW) * e;
      const fh = FH + (FH_END - FH) * e;
      fhNow = fh;
      const base = h - 24 - half * sc * Math.sin(PITCH);
      // While building, keep the newest floor about a third of the way down the stage.
      const follow = Math.max(h - 24 - half * scW * Math.sin(PITCH), h * 0.36 + k * FH * scW * Math.cos(PITCH));
      if (camY < 0 || done) camY = follow;
      const cy = done ? base : camY + (base - camY) * e;
      const v: View = { cx: w / 2, cy, sc, yaw, pitch: PITCH };
      view = v;

      // ground shadow
      const r = half * sc * 1.15;
      const g = ctx.createRadialGradient(v.cx, v.cy, 0, v.cx, v.cy, r);
      g.addColorStop(0, rgba(tk.text, 0.22));
      g.addColorStop(1, rgba(tk.text, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(v.cx, v.cy, r, r * Math.sin(PITCH), 0, 0, Math.PI * 2);
      ctx.fill();

      const thick = fh * sc * Math.cos(PITCH);
      const outline = thick >= 3 ? rgba(shade(mix(tk.surface, tk.accent, 0.45), 0.5), 0.9) : undefined;
      const baseCol = mix(tk.surface, tk.accent, 0.42);
      for (let i = 0; i < k; i++) {
        const f = floors[i]!;
        const age = (clock - placed[i]!) / DROP;
        const drop = done ? 0 : (1 - easeOut(age)) * FH * 6;
        const rr = (f.size / 2) * Math.SQRT2 * sc * Math.sin(PITCH);
        const col = i === hot ? tk.accent : i % 2 ? tint(baseCol, 0.1) : baseCol;
        // skip floors far above the stage while the camera is low
        const yScreen = v.cy - (i * fh + drop) * sc * Math.cos(PITCH);
        if (yScreen + rr < -20 || yScreen - rr > h + 20) continue;
        box(
          ctx,
          v,
          0,
          0,
          f.size,
          f.size,
          i * fh + drop,
          fh - (thick >= 6 ? 1.4 : 0),
          rgba(tint(col, 0.14)),
          rgba(shade(col, 0.14)),
          rgba(shade(col, 0.3)),
          i === hot ? rgba(shade(tk.accent, 0.5)) : outline,
        );
      }
    };

    // Which floor is under a point on the canvas (CSS px), from the last drawn view.
    api.current.pick = (x, y) => {
      if (!view) return null;
      const v = view;
      for (let i = k - 1; i >= 0; i--) {
        const rr = (floors[i]!.size / 2) * Math.SQRT2 * v.sc;
        const top = v.cy - (i + 1) * fhNow * v.sc * Math.cos(PITCH) - rr * Math.sin(PITCH);
        const bottom = v.cy - i * fhNow * v.sc * Math.cos(PITCH) + rr * Math.sin(PITCH);
        if (y >= top && y <= bottom && Math.abs(x - v.cx) <= rr) return i;
      }
      return null;
    };
    api.current.highlight = (i) => {
      hot = i;
      draw();
    };

    const frame = (dt: number) => {
      if (!api.current.playing) return false;
      clock += dt;
      if (k < n) {
        t = Math.min(yrMax, t + dt);
        let kk = k;
        while (kk < n && t >= floors[kk]!.lagY) {
          placed[kk] = clock;
          kk++;
        }
        if (kk !== k) {
          k = kk;
          setLog(k);
        }
        camY += (Math.max(h0(), camTarget()) - camY) * Math.min(1, dt * 4);
      } else {
        pull = Math.min(1, pull + dt / PULLBACK);
      }
      yaw += dt * SPIN;
      if (out.current) out.current.textContent = `Year ${t.toFixed(1)}`;
      draw();
      if (k >= n && pull >= 1) {
        // played once: stop here; Replay starts it again
        done = true;
        api.current.playing = false;
        setFinished(true);
        draw();
        return false;
      }
      return true;
    };
    const h0 = () => c.clientHeight - 24 - half * views(c.clientWidth, c.clientHeight).scW * Math.sin(PITCH);
    const camTarget = () => {
      const { scW } = views(c.clientWidth, c.clientHeight);
      return c.clientHeight * 0.36 + k * FH * scW * Math.cos(PITCH);
    };

    const ro = new ResizeObserver(() => draw());
    ro.observe(c);
    const offTheme = onTheme(() => {
      tk = readTokens();
      draw();
    });
    if (reduced) {
      k = n;
      t = yrMax;
      setLog(n);
      draw();
      return () => {
        ro.disconnect();
        offTheme();
      };
    }

    const loop = visibleLoop(c, frame);
    const reset = () => {
      t = 0;
      k = 0;
      pull = 0;
      camY = -1;
      done = false;
      placed.fill(-1e9);
      setLog(0);
      setFinished(false);
      api.current.playing = true;
      loop.start();
    };
    api.current.replay = reset;
    api.current.toggle = () => {
      api.current.playing = !api.current.playing;
      if (api.current.playing) loop.start();
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- motion is only known in the browser
    setMoving(true);
    // Wait for the landing intro (if it is showing) before building.
    const begin = () => reset();
    let waiting = false;
    if (document.documentElement.classList.contains("intro")) {
      waiting = true;
      setLog(0);
      done = false;
      draw();
      window.addEventListener("babel-intro-done", begin, { once: true });
    } else begin();
    return () => {
      if (waiting) window.removeEventListener("babel-intro-done", begin);
      loop.stop();
      ro.disconnect();
      offTheme();
    };
  }, [floors, yrMax, n]);

  const replay = () => {
    api.current.replay();
    setPaused(false);
  };
  const toggle = () => {
    api.current.toggle();
    setPaused(!api.current.playing);
  };
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = api.current.pick(e.clientX - r.left, e.clientY - r.top);
    if (i !== hover) {
      setHover(i);
      api.current.highlight(i);
    }
  };
  const leave = () => {
    setOver(false);
    setHover(null);
    api.current.highlight(null);
  };
  const open = over || pinned;

  return (
    <div className="tower-hero">
      <div className="th-text">
        {intro}
        <div className="ctl" data-static="">
          {moving ? (
            <>
              <button type="button" onClick={replay}>
                {finished ? "Play again" : "Replay"}
              </button>
              {finished ? null : (
                <button type="button" onClick={toggle} aria-pressed={paused}>
                  {paused ? "Play" : "Pause"}
                </button>
              )}
            </>
          ) : null}
          <button type="button" aria-expanded={pinned} aria-controls={popId} onClick={() => setPinned(!pinned)}>
            What am I looking at?
          </button>
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
      <div className="stage-wrap" onPointerEnter={() => setOver(true)} onPointerLeave={leave}>
        <div className="stage tall">
          <canvas ref={canvas} role="img" aria-label={label} onPointerMove={point} />
        </div>
        <div className={`tower-pop${open ? " on" : ""}`} id={popId} role="note" aria-label="About the tower">
          <b className="pop-title">What you are looking at</b>
          {explain}
          <div className="pop-floor" aria-live="polite">
            {hover !== null && floors[hover] ? (
              floors[hover].info
            ) : (
              <span className="muted">Point at a floor to see which language it is.</span>
            )}
          </div>
          {pinned ? (
            <button type="button" className="chip" onClick={() => setPinned(false)}>
              Close
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
