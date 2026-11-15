export type Source = { name: string; url: string; terms: string };
export type Envelope<T> = {
  dataset: string;
  generated_at: string;
  produced_by: { profile: string; fallback: boolean; run_id: string; babel_version: string };
  window: { start: string | null; end: string | null };
  sources: Source[];
  corrections: string;
  row_count: number;
  rows: T[];
};
export type LanguageRow = {
  wiki: string;
  language: string;
  items_covered: number;
  items_first: number;
  coverage_pct: number;
  median_lag_days: number;
  median_depth_ratio: number | null;
  pageviews: number;
  demand_without_supply: number | null;
  reference_set: string;
};
export type BacktestRow = {
  item_id: number;
  wiki: string;
  created_at: string;
  first_created_at: string;
  lag_days: number;
  languages: number;
};
export type HourRow = {
  hour: string;
  events: number;
  late_events: number;
  human_article_edits: number;
  new_articles: number;
  bot_events: number;
  wikis_active: number;
};
export type Derived = {
  wikis: number;
  hourly: HourRow[];
  peak_hour_events: number;
  totals: Record<string, number>;
  by_wiki: Record<string, Omit<HourRow, "hour" | "wikis_active"> & { wiki: string }>;
};
export type Engine = { name: string; version: string; role: string; active: boolean; last_used: string | null };
export type Stage = {
  stage: string;
  service: string;
  version: string;
  records_in: number | null;
  records_out: number | null;
  seconds: number | null;
  records_per_second: number | null;
  status: string;
};
export type Run = { run_id: string; ended_at: string; status: string; events: number | null; seconds: number | null };
export type Metrics = {
  generated_at: string;
  profile: { produced_by: string; fallback: boolean; reason: string; run_id: string };
  engines: Engine[];
  totals: Record<string, unknown>;
  last_run: { run_id: string; started_at: string; ended_at: string; status: string; stages: Stage[] };
  live: Record<string, number | string | null>;
  history: { runs: Run[]; daily: { day: string; events: number; bytes: number }[] };
  freshness: Record<string, number | string | null>;
  quality: Record<string, number | null>;
  cost: { usd: number; free_quota_use_pct: number | null; free_quota_note: string };
  lineage_summary: { nodes: number; edges: number; documented_pct: number };
};
export type Column = { name: string; type?: string; description?: string };
export type Dataset = {
  name: string;
  layer: string;
  physical: string;
  description: string;
  owner: string;
  domain: string;
  classification: string;
  freshness_sla: string;
  columns: Column[];
};
export type Catalog = {
  generated_at: string;
  completeness: { items: number; documented: number; documented_pct: number };
  datasets: Dataset[];
};
export type Glossary = { terms: { term: string; definition: string }[] };
export type Lineage = {
  generated_at: string;
  nodes: { id: string; kind: string; layer: string }[];
  edges: { from: string; to: string }[];
  columns: { to: string; from: string[] }[];
};
