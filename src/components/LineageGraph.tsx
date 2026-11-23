"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Graph, GNode } from "@/lib/lineage";

const LF = "metadata_lineage.json";
const CF = "metadata_catalog.json";
const PAD = 28;
const LABEL_H = 19;

type Detail = { description?: string; owner?: string; classification?: string; freshness?: string };
type ColMap = { to: string; from: string[] };
type Box = { x: number; y: number; w: number; h: number };

// Lineage as an interactive graph. The whole graph is shown first; hovering or focusing a node
// lights its upstream (blue) and downstream (orange). Clicking a node (or Enter) moves the view to
// that node and its neighbours and opens its details; Escape, the close button or a click on the
// background goes back to the whole graph. Every node is a button in reading order, and the same
// lineage is listed as tables below the graph.
export function LineageGraph({
  graph,
  details,
  columns,
}: {
  graph: Graph;
  details: (Detail | null)[];
  columns: ColMap[];
}) {
  const { nodes, edges, width, height } = graph;
  const full = useMemo<Box>(() => ({ x: -PAD, y: -PAD, w: width + 2 * PAD, h: height + 2 * PAD }), [width, height]);
  const [vb, setVb] = useState<Box>(full);
  const [hover, setHover] = useState<number | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const anim = useRef(0);
  const vbRef = useRef(vb);
  useEffect(() => {
    vbRef.current = vb;
  }, [vb]);
  const focus = hover ?? sel;

  // Animate the view box (instant under reduced motion).
  const go = useCallback((to: Box) => {
    cancelAnimationFrame(anim.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setVb(to);
    const from = vbRef.current;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 520);
      const e = 1 - Math.pow(1 - k, 3);
      setVb({
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
        w: from.w + (to.w - from.w) * e,
        h: from.h + (to.h - from.h) * e,
      });
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, []);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  const select = useCallback(
    (i: number | null) => {
      setSel(i);
      if (i === null) return go(full);
      // the node and its direct neighbours, with the full graph's aspect ratio
      const group = [nodes[i]!, ...nodes[i]!.pre.map((j) => nodes[j]!), ...nodes[i]!.suc.map((j) => nodes[j]!)];
      const x0 = Math.min(...group.map((n) => n.x)) - 60;
      const x1 = Math.max(...group.map((n) => n.x + n.w)) + 60;
      const y0 = Math.min(...group.map((n) => n.y)) - 50;
      const y1 = Math.max(...group.map((n) => n.y + n.h)) + 50;
      let w = Math.max(x1 - x0, 420);
      let h = Math.max(y1 - y0, 220);
      const ratio = full.w / full.h;
      if (w / h > ratio) h = w / ratio;
      else w = h * ratio;
      // On a wide screen the details card sits on the right: keep the group in the left part.
      const wide = typeof window !== "undefined" && window.innerWidth > 760;
      const left = (x0 + x1) / 2 - w / 2;
      const cy = (y0 + y1) / 2;
      if (wide) {
        w *= 1.4;
        h *= 1.4;
      }
      w = Math.min(w, full.w * 1.2);
      h = Math.min(h, full.h * 1.2);
      go({ x: wide ? left - 20 : (x0 + x1) / 2 - w / 2, y: cy - h / 2, w, h });
    },
    [nodes, full, go],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sel !== null) select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, select]);

  const lit = useMemo(() => {
    if (focus === null) return null;
    const n = nodes[focus]!;
    return { up: new Set(n.ups), down: new Set(n.downs) };
  }, [focus, nodes]);

  const edgeState = (a: number, b: number) => {
    if (!lit || focus === null) return "";
    if (lit.up.has(a) && (b === focus || lit.up.has(b))) return "up";
    if ((a === focus || lit.down.has(a)) && lit.down.has(b)) return "down";
    return "dim";
  };
  const nodeState = (i: number) => {
    if (!lit || focus === null) return "";
    if (i === focus) return "focus";
    if (lit.up.has(i)) return "up";
    if (lit.down.has(i)) return "down";
    return "dim";
  };
  const anchorIn = (n: GNode) => ({ x: n.x, y: n.y + n.h / 2 });
  const anchorOut = (n: GNode) => ({ x: n.x + n.w, y: n.y + n.h / 2 });

  // Job names: the selected job first, then the one pointed at. A label goes above its dot, or below
  // when there is no room or it would cover the other label; if it still collides it is left out.
  const jobLabels: { i: number; x: number; y: number; w: number }[] = [];
  for (const i of [sel, hover]) {
    if (i === null || !nodes[i]!.dot || jobLabels.some((l) => l.i === i)) continue;
    const n = nodes[i]!;
    const w = n.id.length * 6.7 + 14;
    const x = Math.max(full.x + 4, Math.min(full.x + full.w - w - 4, n.x + n.w / 2 - w / 2));
    const hits = (y: number) =>
      y < full.y + 2 ||
      y + LABEL_H > full.y + full.h - 2 ||
      jobLabels.some((l) => x < l.x + l.w + 4 && x + w + 4 > l.x && y < l.y + LABEL_H + 4 && y + LABEL_H + 4 > l.y);
    const y = [n.y - LABEL_H - 7, n.y + n.h + 7].find((c) => !hits(c));
    if (y !== undefined) jobLabels.push({ i, x, y, w });
  }

  const s = sel === null ? null : nodes[sel]!;
  const d = s ? details[s.i] : null;

  return (
    <div className={`lineage${s ? " focused" : ""}`}>
      <div className="lineage-wrap">
        <svg
          className="lineage-svg"
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          style={{ aspectRatio: `${full.w} / ${full.h}` }}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Lineage graph: datasets, jobs and models from the Wikimedia sources to the exports. Each node is a button; Enter opens its details."
          onClick={(e) => {
            if (!(e.target as Element).closest("[data-node]") && sel !== null) select(null);
          }}
        >
          <defs>
            <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="arrowhead" />
            </marker>
          </defs>
          <g className="edges" aria-hidden="true">
            {edges.map((e) => {
              const a = anchorOut(nodes[e.from]!);
              const b = anchorIn(nodes[e.to]!);
              const mx = (a.x + b.x) / 2;
              return (
                <path
                  key={e.e}
                  className={`edge ${edgeState(e.from, e.to)}`}
                  d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x - 3},${b.y}`}
                  markerEnd="url(#arr)"
                />
              );
            })}
          </g>
          {nodes.map((n) => (
            <g
              key={n.id}
              data-node=""
              className={`node k-${n.kind} ${nodeState(n.i)}${sel === n.i ? " sel" : ""}${n.dot ? " dot" : ""}`}
              transform={`translate(${n.x},${n.y})`}
              tabIndex={0}
              role="button"
              aria-pressed={sel === n.i}
              aria-label={`${n.id}, ${n.kind.replace("_", " ")} in the ${n.layer} layer`}
              onPointerEnter={() => setHover(n.i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(n.i)}
              onBlur={() => setHover(null)}
              onClick={() => select(sel === n.i ? null : n.i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(sel === n.i ? null : n.i);
                }
              }}
            >
              {n.dot ? (
                <circle cx={n.w / 2} cy={n.h / 2} r={n.w / 2} />
              ) : (
                <>
                  <rect width={n.w} height={n.h} rx={5} />
                  <text x={9} y={5 + 12} data-src={`${LF}#/nodes/${n.i}/id`} data-as="raw">
                    {n.lines.map((line, j) => (
                      <tspan key={j} x={9} dy={j ? 14 : 0}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </>
              )}
            </g>
          ))}
          {/* Job names, drawn last so nothing covers them: only the job pointed at and the selected one,
              on a solid label, kept inside the graph. */}
          <g className="job-labels" aria-hidden="true">
            {jobLabels.map((l) => (
              <g key={l.i} transform={`translate(${l.x},${l.y})`} className={l.i === sel ? "sel" : undefined}>
                <rect width={l.w} height={LABEL_H} rx={5} className="job-label-bg" />
                <text x={7} y={13.5} className="job-label" data-src={`${LF}#/nodes/${l.i}/id`} data-as="raw">
                  {nodes[l.i]!.id}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {s ? (
          <aside className="lineage-card" aria-live="polite" aria-label="Node details">
            <button type="button" className="card-close" onClick={() => select(null)} aria-label="Close details and show the whole graph">
              ×
            </button>
            <p className="eyebrow">
              <span data-src={`${LF}#/nodes/${s.i}/kind`} data-as="raw">
                {s.kind}
              </span>{" "}
              ·{" "}
              <span data-src={`${LF}#/nodes/${s.i}/layer`} data-as="raw">
                {s.layer}
              </span>
            </p>
            <h3>
              <span data-src={`${LF}#/nodes/${s.i}/id`} data-as="raw">
                {s.id}
              </span>
            </h3>
            {d?.description ? (
              <p className="small">
                <span data-src={`${CF}#/datasets/${s.cat}/description`} data-as="raw">
                  {d.description}
                </span>
              </p>
            ) : null}
            {d?.owner ? (
              <p className="small muted">
                Owner{" "}
                <span data-src={`${CF}#/datasets/${s.cat}/owner`} data-as="raw">
                  {d.owner}
                </span>{" "}
                · freshness{" "}
                <span data-src={`${CF}#/datasets/${s.cat}/freshness_sla`} data-as="raw">
                  {d.freshness}
                </span>
              </p>
            ) : null}
            <NodeList title="Made from" ids={s.pre} nodes={nodes} pick={select} />
            <NodeList title="Feeds" ids={s.suc} nodes={nodes} pick={select} />
            {s.cols.length ? (
              <details>
                <summary className="small">Column lineage</summary>
                <ul className="small">
                  {s.cols.map((k) => (
                    <li key={k}>
                      <code data-src={`${LF}#/columns/${k}/to`} data-as="raw">
                        {columns[k]!.to}
                      </code>{" "}
                      from{" "}
                      {columns[k]!.from.map((f, j) => (
                        <span key={j}>
                          {j ? ", " : ""}
                          <code data-src={`${LF}#/columns/${k}/from/${j}`} data-as="raw">
                            {f}
                          </code>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            <p className="small muted">The full chain upstream is lit in blue, downstream in orange.</p>
          </aside>
        ) : null}
      </div>
      <p className="key legend">
        <span className="lg k-dataset" /> dataset <span className="lg k-dbt_model" /> dbt model{" "}
        <span className="lg k-job" /> job · Click a node to focus on it; Escape or the background returns to the whole
        graph.
      </p>
    </div>
  );
}

function NodeList({
  title,
  ids,
  nodes,
  pick,
}: {
  title: string;
  ids: number[];
  nodes: Graph["nodes"];
  pick: (i: number) => void;
}) {
  if (!ids.length) return null;
  return (
    <>
      <h4>{title}</h4>
      <ul className="nodelist small">
        {ids.map((i) => (
          <li key={i}>
            <button type="button" className="linkish" onClick={() => pick(i)}>
              <span data-src={`${LF}#/nodes/${i}/id`} data-as="raw">
                {nodes[i]!.id}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
