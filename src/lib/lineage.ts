// Layout of the lineage graph, computed at build time from metadata_lineage.json.
// Columns follow the longest path from a source (so every edge points right); rows inside a column
// are ordered to keep edges short (a few barycentre sweeps). Datasets and models are labelled
// boxes whose names wrap at underscores; jobs are small dots, named on hover, focus or selection,
// so the whole graph fits the page width. Pure function, no DOM.
import type { Catalog, Lineage } from "./types";

export type GNode = {
  i: number; // index in lineage.nodes (for traced labels)
  id: string;
  kind: string;
  layer: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dot: boolean; // a job: drawn as a dot
  lines: string[]; // the id, wrapped (joined, the lines give back the id exactly)
  ups: number[]; // every ancestor (node indexes)
  downs: number[]; // every descendant
  pre: number[]; // direct inputs
  suc: number[]; // direct outputs
  cat: number; // index in catalog.datasets, or -1
  cols: number[]; // indexes in lineage.columns whose target column belongs to this node
};
export type GEdge = { from: number; to: number; e: number };
export type Graph = { nodes: GNode[]; edges: GEdge[]; width: number; height: number };

const GAP_X = 46;
const GAP_Y = 14;
const CHAR = 7.2; // monospace label at 12px
const LINE = 14;
const PAD_X = 18;
const PAD_Y = 10;
const DOT = 14;
const WRAP = 15;

// Break an id after "_", ":" or "." so no line is longer than WRAP characters where possible.
export function wrapId(id: string): string[] {
  const parts = id.split(/(?<=[_:.])/);
  const lines: string[] = [];
  let cur = "";
  for (const p of parts) {
    if (cur && (cur + p).length > WRAP) {
      lines.push(cur);
      cur = p;
    } else cur += p;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function layoutLineage(l: Lineage, cat: Catalog | null): Graph {
  const index = new Map(l.nodes.map((n, i) => [n.id, i]));
  const edges: GEdge[] = [];
  l.edges.forEach((e, k) => {
    const a = index.get(e.from);
    const b = index.get(e.to);
    if (a !== undefined && b !== undefined && a !== b) edges.push({ from: a, to: b, e: k });
  });
  const n = l.nodes.length;
  const preds: number[][] = Array.from({ length: n }, () => []);
  const succs: number[][] = Array.from({ length: n }, () => []);
  for (const e of edges) {
    preds[e.to]!.push(e.from);
    succs[e.from]!.push(e.to);
  }

  // rank = longest path from a node with no predecessors (cycle-safe)
  const rank = new Array<number>(n).fill(-1);
  const visiting = new Set<number>();
  const rankOf = (v: number): number => {
    if (rank[v]! >= 0) return rank[v]!;
    if (visiting.has(v)) return 0;
    visiting.add(v);
    const r = preds[v]!.length ? Math.max(...preds[v]!.map(rankOf)) + 1 : 0;
    visiting.delete(v);
    rank[v] = r;
    return r;
  };
  for (let v = 0; v < n; v++) rankOf(v);

  const cols: number[][] = [];
  for (let v = 0; v < n; v++) (cols[rank[v]!] ??= []).push(v);
  cols.forEach((c) => c.sort((a, b) => l.nodes[a]!.id.localeCompare(l.nodes[b]!.id)));

  const pos = new Array<number>(n).fill(0);
  const place = () => cols.forEach((c) => c.forEach((v, r) => (pos[v] = r)));
  place();
  const bary = (v: number, nb: number[]) => (nb.length ? nb.reduce((s, u) => s + pos[u]!, 0) / nb.length : pos[v]!);
  for (let sweep = 0; sweep < 4; sweep++) {
    for (let c = 1; c < cols.length; c++) cols[c]!.sort((a, b) => bary(a, preds[a]!) - bary(b, preds[b]!));
    place();
    for (let c = cols.length - 2; c >= 0; c--) cols[c]!.sort((a, b) => bary(a, succs[a]!) - bary(b, succs[b]!));
    place();
  }

  const reach = (start: number, next: number[][]) => {
    const seen = new Set<number>();
    const stack = [...next[start]!];
    while (stack.length) {
      const v = stack.pop()!;
      if (seen.has(v)) continue;
      seen.add(v);
      stack.push(...next[v]!);
    }
    return [...seen];
  };
  const datasets = new Map((cat?.datasets ?? []).map((d, i) => [d.name, i]));
  const size = (v: number) => {
    const node = l.nodes[v]!;
    if (node.kind === "job") return { w: DOT, h: DOT, lines: [node.id] };
    const lines = wrapId(node.id);
    return { w: Math.max(...lines.map((s) => s.length)) * CHAR + PAD_X, h: lines.length * LINE + PAD_Y, lines };
  };
  const sizes = Array.from({ length: n }, (_, v) => size(v));
  const colH = cols.map((c) => c.reduce((s, v) => s + sizes[v]!.h, 0) + GAP_Y * (c.length - 1));
  const tallest = Math.max(...colH);

  const nodes: GNode[] = new Array(n);
  let x = 0;
  cols.forEach((c, ci) => {
    const w = Math.max(...c.map((v) => sizes[v]!.w));
    let y = (tallest - colH[ci]!) / 2;
    for (const v of c) {
      const node = l.nodes[v]!;
      const s = sizes[v]!;
      const name = node.id.replace(/^(job|dbt):/, "");
      nodes[v] = {
        i: v,
        id: node.id,
        kind: node.kind,
        layer: node.layer,
        x: x + (w - s.w) / 2,
        y,
        w: s.w,
        h: s.h,
        dot: node.kind === "job",
        lines: s.lines,
        ups: reach(v, preds),
        downs: reach(v, succs),
        pre: preds[v]!,
        suc: succs[v]!,
        cat: datasets.get(node.id) ?? datasets.get(name) ?? -1,
        cols: l.columns.flatMap((col, k) => (col.to.startsWith(`${node.id}.`) ? [k] : [])),
      };
      y += s.h + GAP_Y;
    }
    x += w + GAP_X;
  });
  return { nodes, edges, width: Math.max(0, x - GAP_X), height: tallest };
}
