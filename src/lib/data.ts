// Build-time loader for data/site/ (written by scripts/fetch-data.mjs). Server components only.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  BacktestRow,
  Catalog,
  Derived,
  Envelope,
  Glossary,
  LanguageRow,
  Lineage,
  Metrics,
  SpreadingRow,
  UpdateLagRow,
} from "./types";

export const DATA_DIR = process.env.BABEL_DATA_DIR ?? join(process.cwd(), "data", "site");

type Report = { files: Record<string, { ok: boolean; reason?: string }> };
const cache = new Map<string, unknown>();

// A file is rendered only if fetch-data accepted it; otherwise null and the page says so.
export function load<T>(file: string): T | null {
  if (cache.has(file)) return cache.get(file) as T | null;
  let doc: T | null = null;
  try {
    const report = JSON.parse(readFileSync(join(DATA_DIR, "_fetch.json"), "utf8")) as Report;
    if (report.files[file]?.ok) doc = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")) as T;
  } catch {
    doc = null;
  }
  cache.set(file, doc);
  return doc;
}

export const languages = () => load<Envelope<LanguageRow>>("languages.json");
export const backtests = () => load<Envelope<BacktestRow>>("backtests.json");
export const updateLag = () => load<Envelope<UpdateLagRow>>("update_lag.json");
export const spreading = () => load<Envelope<SpreadingRow>>("spreading.json");
export const derived = () => load<Derived>("derived.json");
export const metrics = () => load<Metrics>("pipeline_metrics.json");
export const catalog = () => load<Catalog>("metadata_catalog.json");
export const glossary = () => load<Glossary>("metadata_glossary.json");
export const lineage = () => load<Lineage>("metadata_lineage.json");

export type Ranked = LanguageRow & { i: number };
// Rows with their index in the export (for pointers), ordered by median lag, shortest first.
export function byLag(rows: LanguageRow[]): Ranked[] {
  return rows.map((r, i) => ({ ...r, i })).sort((a, b) => a.median_lag_days - b.median_lag_days);
}

export type Spread = BacktestRow & { i: number };
// Backtest rows grouped by item, each group ordered by lag (the first language first).
export function byItem(rows: BacktestRow[]): Map<number, Spread[]> {
  const groups = new Map<number, Spread[]>();
  rows.forEach((r, i) => groups.set(r.item_id, [...(groups.get(r.item_id) ?? []), { ...r, i }]));
  for (const g of groups.values()) g.sort((a, b) => a.lag_days - b.lag_days || a.wiki.localeCompare(b.wiki));
  return groups;
}
// Wikipedia language code of a wiki database name ("zh_min_nanwiki" -> "zh_min_nan").
export const wikiLang = (wiki: string) => wiki.replace(/wiki$/, "");
