"use client";
import { useEffect, useRef, useState } from "react";
import { box, depth, easeOut, fitCanvas, onTheme, prefersReducedMotion, readTokens, rgba, shade, tint, visibleLoop, type View } from "@/lib/iso";

const STEP = 0.4; // seconds per measured hour
const SETTLE = 0.5; // seconds for the last column to finish growing before the replay stops
const SPACING = 27;
const SIDE = 20;
const MAXH = 240;

// The live stream as brickwork on a canvas: one column per measured hour, laid in order.
// `heights` are 0..1 of the busiest hour; `labels` name each hour.
export function HourColumns({ heights, labels, label }: { heights: number[]; labels: string[]; label: string }) {
  const n = heights.length;
  const canvas = useRef<HTMLCanvasElement>(null);
  const out = useRef<HTMLOutputElement>(null);
  const ctl = useRef({ playing: true, replay: () => {}, toggle: () => {} });
  const [paused, setPaused] = useState(false);
  const [moving, setMoving] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || n === 0) return;
    const reduced = prefersReducedMotion();
    let tk = readTokens();
    let e = reduced ? n * STEP : 0;
    let k = reduced ? n - 1 : -1;
    const placed = new Float64Array(n).fill(-1e9);
    let clock = 0;
    const order = heights.map((_, i) => i);

    const draw = () => {
      const [w, h] = fitCanvas(c, ctx);
      ctx.clearRect(0, 0, w, h);
      const rowW = n * SPACING;
      const yaw = -0.5;
      const pitch = 0.5;
      const sc = Math.min(1, (w - 30) / (rowW * Math.abs(Math.cos(yaw)) + SIDE * 2), (h - 30) / (MAXH * Math.cos(pitch) + rowW * Math.abs(Math.sin(yaw)) * Math.sin(pitch)));
      const v: View = { cx: w / 2, cy: h * 0.5 + (MAXH * Math.cos(pitch) * sc) / 2, sc, yaw, pitch };
      const x = (i: number) => (i - (n - 1) / 2) * SPACING;
      order.sort((a, b) => depth(v, x(a), 0) - depth(v, x(b), 0));
      const top = rgba(tint(tk.data, 0.15));
      const sideA = rgba(shade(tk.data, 0.12));
      const sideB = rgba(shade(tk.data, 0.3));
      for (const i of order) {
        if (i > k) continue;
        const grow = reduced ? 1 : easeOut((clock - placed[i]!) / 0.35);
        const hh = Math.max(2, heights[i]! * MAXH) * grow;
        const cur = i === k && !reduced;
        box(
          ctx,
          v,
          x(i),
          0,
          SIDE,
          SIDE,
          0,
          hh,
          cur ? rgba(tint(tk.accent, 0.1)) : top,
          cur ? rgba(shade(tk.accent, 0.12)) : sideA,
          cur ? rgba(shade(tk.accent, 0.28)) : sideB,
        );
      }
    };

    const frame = (dt: number) => {
      if (!ctl.current.playing) return false;
      clock += dt;
      e += dt;
      const next = Math.min(n - 1, Math.floor(e / STEP));
      while (k < next) {
        k++;
        placed[k] = clock;
        if (out.current) out.current.textContent = labels[k] ?? "";
      }
      draw();
      if (e > n * STEP + SETTLE) {
        // played once: stop on the last hour; "Play again" starts over
        ctl.current.playing = false;
        setFinished(true);
        return false;
      }
      return true;
    };

    const ro = new ResizeObserver(() => draw());
    ro.observe(c);
    const offTheme = onTheme(() => {
      tk = readTokens();
      draw();
    });
    if (reduced) {
      draw();
      return () => {
        ro.disconnect();
        offTheme();
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- motion is only known in the browser
    setMoving(true);
    const loop = visibleLoop(c, frame);
    ctl.current.replay = () => {
      e = 0;
      k = -1;
      placed.fill(-1e9);
      ctl.current.playing = true;
      setFinished(false);
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
  }, [heights, labels, n]);

  return (
    <>
      <div className="ctl" data-static="">
        {moving ? (
          <>
            <button
              type="button"
              onClick={() => {
                ctl.current.replay();
                setPaused(false);
              }}
            >
              {finished ? "Play again" : "Replay"}
            </button>
            {finished ? null : (
              <button
                type="button"
                aria-pressed={paused}
                onClick={() => {
                  ctl.current.toggle();
                  setPaused(!ctl.current.playing);
                }}
              >
                {paused ? "Play" : "Pause"}
              </button>
            )}
          </>
        ) : null}
        <output ref={out}>{labels[n - 1]}</output>
        <span>replay of the measured hours, oldest first; not a live feed</span>
      </div>
      <div className="stage low">
        <canvas ref={canvas} role="img" aria-label={label} />
      </div>
    </>
  );
}
