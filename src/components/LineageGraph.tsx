"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Graph } from "@/lib/lineage";

const H = 30; // node height
const LF = "metadata_lineage.json";
const CF = "metadata_catalog.json";

type Detail = { description?: string; owner?: string; classification?: string; freshness?: string };
type ColMap = { to: string; from: string[] };

// Lineage as an interactive graph: drag to pan, buttons or Ctrl+wheel to zoom, hover or focus a node
// to light its upstream and downstream, click or Enter for details. Every node is a button in
// reading order, and the same lineage is listed as tables below the graph.
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
  const M = 24;
  const full = useMemo(() => ({ x: -M, y: -M, w: width + 2 * M, h: height + 2 * M }), [width, height]);
  // Start readable: about four columns of nodes at once, beginning with the sources.
  const start = useMemo(() => {
    const w = Math.min(full.w, Math.max(900, (full.h * 16) / 9));
    return { ...full, w, h: Math.max(full.h, (w * 9) / 16) };
  }, [full]);
  const [vb, setVb] = useState(start);
  const [hover, setHover] = useState<number | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; vb: typeof full; moved: boolean } | null>(null);
  const focus = hover ?? sel;

  const lit = useMemo(() => {
    if (focus === null) return null;
    const n = nodes[focus]!;
    return { up: new Set(n.ups), down: new Set(n.downs) };
  }, [focus, nodes]);

  const zoom = useCallback(
    (f: number, cx?: number, cy?: number) =>
      setVb((v) => {
        const w = Math.min(full.w * 1.6, Math.max(160, v.w * f));
        const h = (w / v.w) * v.h;
        const px = cx ?? v.x + v.w / 2;
        const py = cy ?? v.y + v.h / 2;
        return { x: px - ((px - v.x) * w) / v.w, y: py - ((py - v.y) * h) / v.h, w, h };
      }),
    [full],
  );

  // Ctrl/Cmd + wheel zooms around the pointer; a plain wheel keeps scrolling the page.
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setVb((v) => {
        const px = v.x + ((e.clientX - r.left) / r.width) * v.w;
        const py = v.y + ((e.clientY - r.top) / r.height) * v.h;
        const f = e.deltaY > 0 ? 1.12 : 1 / 1.12;
        const w = Math.min(full.w * 1.6, Math.max(160, v.w * f));
        const h = (w / v.w) * v.h;
        return { x: px - ((px - v.x) * w) / v.w, y: py - ((py - v.y) * h) / v.h, w, h };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [full]);

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("[data-node]")) return;
    drag.current = { x: e.clientX, y: e.clientY, vb, moved: false };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = svg.current;
    if (!d || !el) return;
    const r = el.getBoundingClientRect();
    const k = Math.max(d.vb.w / r.width, d.vb.h / r.height);
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 3) d.moved = true;
    setVb({ ...d.vb, x: d.vb.x - (e.clientX - d.x) * k, y: d.vb.y - (e.clientY - d.y) * k });
  };
  const onUp = () => {
    if (drag.current && !drag.current.moved) setSel(null);
    drag.current = null;
  };

  const edgeState = (a: number, b: number) => {
    if (!lit || focus === null) return "";
    // a -> b lies on a path into the focus node, or on a path out of it
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

  const s = sel === null ? null : nodes[sel]!;
  const d = s ? details[s.i] : null;

  return (
    <div className="lineage">
      <div className="ctl" role="toolbar" aria-label="Graph view">
        <button type="button" onClick={() => zoom(1 / 1.25)}>
          Zoom in
        </button>
        <button type="button" onClick={() => zoom(1.25)}>
          Zoom out
        </button>
        <button type="button" onClick={() => setVb(full)}>
          Show all
        </button>
        <button type="button" onClick={() => setVb(start)}>
          Reset
        </button>
        <span className="small muted">Drag to pan · Ctrl and wheel to zoom · Tab through the nodes, Enter for details</span>
      </div>
      <div className="lineage-wrap">
        <svg
          ref={svg}
          className="lineage-svg"
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          preserveAspectRatio="xMinYMid meet"
          role="group"
          aria-label="Lineage graph: datasets, jobs and models from the Wikimedia sources to the exports. Each node is a button."
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <defs>
            <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="arrowhead" />
            </marker>
          </defs>
          <g className="edges" aria-hidden="true">
            {edges.map((e) => {
              const a = nodes[e.from]!;
              const b = nodes[e.to]!;
              const x1 = a.x + a.w;
              const y1 = a.y + H / 2;
              const x2 = b.x - 4;
              const y2 = b.y + H / 2;
              const mx = (x1 + x2) / 2;
              return (
                <path
                  key={e.e}
                  className={`edge ${edgeState(e.from, e.to)}`}
                  d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  markerEnd="url(#arr)"
                />
              );
            })}
          </g>
          {nodes.map((n) => (
            <g
              key={n.id}
              data-node=""
              className={`node k-${n.kind} ${nodeState(n.i)}${sel === n.i ? " sel" : ""}`}
              transform={`translate(${n.x},${n.y})`}
              tabIndex={0}
              role="button"
              aria-pressed={sel === n.i}
              aria-label={`${n.id}, ${n.kind.replace("_", " ")} in the ${n.layer} layer`}
              onPointerEnter={() => setHover(n.i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(n.i)}
              onBlur={() => setHover(null)}
              onClick={() => setSel(sel === n.i ? null : n.i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSel(sel === n.i ? null : n.i);
                }
                if (e.key === "Escape") setSel(null);
              }}
            >
              <rect width={n.w} height={H} rx={n.kind === "job" ? 15 : 5} />
              <text x={12} y={H / 2 + 4} data-src={`${LF}#/nodes/${n.i}/id`} data-as="raw">
                {n.id}
              </text>
            </g>
          ))}
        </svg>
        <aside className="lineage-panel" aria-live="polite">
          {s ? (
            <>
              <h3>
                <span data-src={`${LF}#/nodes/${s.i}/id`} data-as="raw">
                  {s.id}
                </span>
              </h3>
              <p className="small muted">
                <span data-src={`${LF}#/nodes/${s.i}/kind`} data-as="raw">
                  {s.kind}
                </span>{" "}
                ·{" "}
                <span data-src={`${LF}#/nodes/${s.i}/layer`} data-as="raw">
                  {s.layer}
                </span>{" "}
                layer
              </p>
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
              <NodeList title="Comes from" ids={s.ups} nodes={nodes} pick={setSel} />
              <NodeList title="Feeds" ids={s.downs} nodes={nodes} pick={setSel} />
              {s.cols.length ? (
                <>
                  <h4>Column lineage</h4>
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
                </>
              ) : null}
              <button type="button" className="chip" onClick={() => setSel(null)}>
                Close
              </button>
            </>
          ) : (
            <p className="small muted">
              Select a node to see what it is, what it comes from and what it feeds. Hover or focus lights its
              upstream in blue and its downstream in orange.
            </p>
          )}
        </aside>
      </div>
      <p className="key legend">
        <span className="lg k-dataset" /> dataset <span className="lg k-job" /> job <span className="lg k-dbt_model" /> dbt
        model
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
