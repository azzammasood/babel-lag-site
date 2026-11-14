"use client";
import { useEffect, useRef, useState } from "react";

export type Floor = {
  lagY: number; // median lag in years: when the floor is placed (1 second = 1 year)
  size: number; // px, from coverage
  front: React.ReactNode;
  side: React.ReactNode;
  log: React.ReactNode;
};

const FH = 27;
const HOLD = 5;

// The Babel tower: one floor per language, placed when the clock reaches its median lag.
// The clock is the only thing that changes what is shown; the slow turn is so each face can be read.
export function Tower({ floors, yrMax, label }: { floors: Floor[]; yrMax: number; label: string }) {
  const n = floors.length;
  const world = useRef<HTMLDivElement>(null);
  const out = useRef<HTMLOutputElement>(null);
  const clock = useRef({ t0: null as number | null, at: 0, paused: false });
  // Server render and reduced motion: the finished tower.
  const [built, setBuilt] = useState(n);
  const [paused, setPaused] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const fit = () => {
      const st = world.current?.parentElement;
      if (st && world.current) {
        world.current.style.setProperty("--sc", Math.min(1, st.clientWidth / 640, st.clientHeight / 700).toFixed(3));
      }
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
        if (e > yrMax + HOLD) {
          c.t0 = now;
          e = 0;
        }
        c.at = e;
        const t = Math.min(yrMax, e);
        const k = floors.filter((f) => t >= f.lagY).length;
        setBuilt((p) => (p === k ? p : k));
        if (out.current) out.current.textContent = `Year ${t.toFixed(1)}`;
        if (world.current) {
          world.current.style.transform = `scale(var(--sc, 1)) rotateX(-14deg) rotateY(${(28 + (now / 1000) * 7).toFixed(2)}deg)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", fit);
    };
  }, [floors, yrMax]);

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
  const newest = built < n ? built - 1 : -1;

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
        <output ref={out}>Year {yrMax.toFixed(1)}</output>
        <span>
          {built} of {n} floors built · 1 second = 1 year of median lag
        </span>
      </div>
      <div className="split">
        <div className="stage" role="img" aria-label={label}>
          <div className="stage3d" aria-hidden="true">
            <div className="world" ref={world}>
              <div className="ground" />
              {floors.map((f, i) => (
                <div
                  key={i}
                  className={`fl3${i < built ? " in" : ""}${i === newest ? " new" : ""}`}
                  style={{ "--y": `${-(i * FH + FH / 2)}px` } as React.CSSProperties}
                >
                  <div
                    className="bx"
                    style={{ "--w": `${f.size}px`, "--h": `${FH - 2}px`, "--d": `${f.size}px` } as React.CSSProperties}
                  >
                    <i className="fr">{f.front}</i>
                    <i className="bk">{f.front}</i>
                    <i className="lf">{f.side}</i>
                    <i className="rt">{f.side}</i>
                    <i className="tp" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ol className="log" reversed aria-label="Floors, top to bottom">
          {floors
            .map((f, i) => (
              <li key={i} className={`${i < built ? "in" : ""}${i === newest ? " new" : ""}`}>
                {f.log}
              </li>
            ))
            .reverse()}
        </ol>
      </div>
    </>
  );
}
