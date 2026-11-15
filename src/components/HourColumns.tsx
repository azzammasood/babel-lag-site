"use client";
import { useEffect, useRef, useState } from "react";

const STEP = 0.4;
const HOLD = 5;

// The live stream as brickwork: one 3D column per measured hour, laid in order.
// `heights` are px, already scaled from the measured events; `labels` name each hour.
export function HourColumns({ heights, labels, label }: { heights: number[]; labels: string[]; label: string }) {
  const n = heights.length;
  const world = useRef<HTMLDivElement>(null);
  const clock = useRef({ t0: null as number | null, at: 0, paused: false });
  const [k, setK] = useState(n - 1); // server render and reduced motion: every column laid
  const [paused, setPaused] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const fit = () => {
      const st = world.current?.parentElement;
      if (st && world.current) world.current.style.setProperty("--sc", Math.min(1, st.clientWidth / (n * 27 + 120)).toFixed(3));
    };
    fit();
    addEventListener("resize", fit);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => removeEventListener("resize", fit);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- motion is only known in the browser
    setMoving(true);
    let raf = 0;
    const tick = (now: number) => {
      const c = clock.current;
      if (!c.paused) {
        if (c.t0 === null) c.t0 = now;
        let e = (now - c.t0) / 1000;
        if (e > n * STEP + HOLD) {
          c.t0 = now;
          e = 0;
        }
        c.at = e;
        const next = Math.min(n - 1, Math.floor(e / STEP));
        setK((p) => (p === next ? p : next));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", fit);
    };
  }, [n]);

  const replay = () => {
    clock.current.t0 = null;
    clock.current.paused = false;
    setPaused(false);
  };
  const toggle = () => {
    const c = clock.current;
    c.paused = !c.paused;
    if (!c.paused) c.t0 = performance.now() - c.at * 1000;
    setPaused(c.paused);
  };

  return (
    <>
      <div className="ctl" data-static="">
        {moving ? (
          <>
            <button type="button" onClick={replay}>
              Replay
            </button>
            <button type="button" onClick={toggle}>
              {paused ? "Play" : "Pause"}
            </button>
          </>
        ) : null}
        <output>{labels[k]}</output>
        <span>replay of the measured hours, oldest first; not a live feed</span>
      </div>
      <div className="stage low" role="img" aria-label={label}>
        <div className="stage3d" aria-hidden="true" style={{ perspectiveOrigin: "50% 20%" }}>
          <div className="world flat" ref={world}>
            <div className="ground" />
            {heights.map((h, i) => (
              <div
                key={i}
                className={`col3${i <= k ? " in" : ""}${i === k && moving ? " new" : ""}`}
                style={{ transform: `translate3d(${(i - (n - 1) / 2) * 27}px,${-h / 2}px,0)` }}
              >
                <div className="bx" style={{ "--w": "20px", "--h": `${h}px`, "--d": "20px" } as React.CSSProperties}>
                  <i className="fr" />
                  <i className="bk" />
                  <i className="lf" />
                  <i className="rt" />
                  <i className="tp" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
