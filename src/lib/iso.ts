// Small canvas helpers for the 3D scenes (tower, hour columns). Browser only.
// Orthographic projection with a rotating camera above the scene: cheap enough to redraw a few
// thousand faces every frame, with no DOM per face.

export type RGB = [number, number, number];
export type Tokens = Record<"bg" | "surface" | "text" | "muted" | "accent" | "data" | "dim", RGB>;

function hex(s: string): RGB {
  const m = s.trim().replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m.slice(0, 6);
  const n = parseInt(full || "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Theme colours from the CSS custom properties, so the canvas follows light and dark mode.
export function readTokens(): Tokens {
  const cs = getComputedStyle(document.documentElement);
  const get = (n: string) => hex(cs.getPropertyValue(`--${n}`));
  return {
    bg: get("bg"),
    surface: get("surface"),
    text: get("text"),
    muted: get("muted"),
    accent: get("accent"),
    data: get("data"),
    dim: get("dim"),
  };
}

export const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
export const rgba = (c: RGB, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const BLACK: RGB = [0, 0, 0];
const WHITE: RGB = [255, 255, 255];
export const shade = (c: RGB, t: number) => mix(c, BLACK, t);
export const tint = (c: RGB, t: number) => mix(c, WHITE, t);

export type View = { cx: number; cy: number; sc: number; yaw: number; pitch: number };

// World (x, y up, z) to screen. Larger depth = nearer the camera.
export function project(v: View, x: number, y: number, z: number): [number, number, number] {
  const c = Math.cos(v.yaw);
  const s = Math.sin(v.yaw);
  const xr = x * c - z * s;
  const zr = x * s + z * c;
  return [v.cx + xr * v.sc, v.cy - y * v.sc * Math.cos(v.pitch) + zr * v.sc * Math.sin(v.pitch), zr];
}

export const depth = (v: View, x: number, z: number) => x * Math.sin(v.yaw) + z * Math.cos(v.yaw);

const EDGES: [number, number, number, number][] = [
  // corner a, corner b, outward normal x, outward normal z
  [0, 1, 0, -1],
  [1, 2, 1, 0],
  [2, 3, 0, 1],
  [3, 0, -1, 0],
];

// An axis-aligned box: footprint w x d centred on (x, z), from y0 up to y0 + h.
// Draws the sides that face the camera, then the top.
export function box(
  ctx: CanvasRenderingContext2D,
  v: View,
  x: number,
  z: number,
  w: number,
  d: number,
  y0: number,
  h: number,
  top: string,
  sideA: string,
  sideB: string,
) {
  const hw = w / 2;
  const hd = d / 2;
  const cs: [number, number][] = [
    [x - hw, z - hd],
    [x + hw, z - hd],
    [x + hw, z + hd],
    [x - hw, z + hd],
  ];
  const sn = Math.sin(v.yaw);
  const co = Math.cos(v.yaw);
  for (const [a, b, nx, nz] of EDGES) {
    if (nx * sn + nz * co <= 0) continue;
    const [ax, az] = cs[a]!;
    const [bx, bz] = cs[b]!;
    const p1 = project(v, ax, y0, az);
    const p2 = project(v, bx, y0, bz);
    const p3 = project(v, bx, y0 + h, bz);
    const p4 = project(v, ax, y0 + h, az);
    ctx.fillStyle = nx !== 0 ? sideA : sideB;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = top;
  ctx.beginPath();
  cs.forEach(([cx, cz], i) => {
    const p = project(v, cx, y0 + h, cz);
    if (i) ctx.lineTo(p[0], p[1]);
    else ctx.moveTo(p[0], p[1]);
  });
  ctx.closePath();
  ctx.fill();
}

// Size the canvas backing store to its CSS box, with the device pixel ratio capped at 2.
export function fitCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): [number, number] {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = c.clientWidth;
  const h = c.clientHeight;
  const bw = Math.max(1, Math.round(w * dpr));
  const bh = Math.max(1, Math.round(h * dpr));
  if (c.width !== bw || c.height !== bh) {
    c.width = bw;
    c.height = bh;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [w, h];
}

export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// Run `frame(dt)` on animation frames only while the element is on screen and the tab is visible.
// dt is in seconds and capped, so time does not jump after the tab comes back.
export function visibleLoop(el: Element, frame: (dt: number, now: number) => boolean) {
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let running = false;
  const tick = (now: number) => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    const more = frame(dt, now);
    if (more && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
    else {
      running = false;
      last = 0;
    }
  };
  const start = () => {
    if (running || !onScreen || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((es) => {
    onScreen = es.some((e) => e.isIntersecting);
    if (onScreen) start();
  });
  io.observe(el);
  const vis = () => {
    if (!document.hidden) start();
  };
  document.addEventListener("visibilitychange", vis);
  return {
    start,
    stop: () => {
      cancelAnimationFrame(raf);
      running = false;
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    },
  };
}

// Redraw when the colour mode changes (toggle or system setting).
export function onTheme(cb: () => void) {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const h = () => requestAnimationFrame(cb);
  window.addEventListener("babel-theme", h);
  mq.addEventListener("change", h);
  return () => {
    window.removeEventListener("babel-theme", h);
    mq.removeEventListener("change", h);
  };
}

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
