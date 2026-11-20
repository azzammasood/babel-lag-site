import {
  siApachekafka,
  siApachespark,
  siDatabricks,
  siDuckdb,
  siGithub,
  siGithubactions,
  siGithubpages,
  siGrafana,
  siJson,
  siNextdotjs,
  siOpenrouter,
  siOpentelemetry,
  siPrometheus,
  siPython,
  siWikidata,
  siWikipedia,
} from "simple-icons";
import { S } from "@/components/V";

// Logos are Simple Icons (CC0), bundled at build time; nothing is hot-linked. A tool without a
// Simple Icons logo gets a lettered badge. Every tool here is one the pipeline recorded doing real
// work (README "What produced the current data" and docs/claims-audit.md).
type Icon = { path: string; hex: string };
type Tool = {
  name: string;
  role: string;
  icon?: Icon;
  badge?: string;
  lane: "free" | "full" | "both";
  local?: boolean; // verified on the local Docker stack only
};
type Stage = { title: string; tools: Tool[] };

const STAGES: Stage[] = [
  {
    title: "Sources",
    tools: [
      { name: "Wikimedia EventStreams", role: "every live change on every wiki", icon: siWikipedia, lane: "both" },
      { name: "MediaWiki history dumps", role: "every revision of every article", icon: siWikipedia, lane: "both" },
      { name: "Pageview dumps", role: "human views per article and day", icon: siWikipedia, lane: "both" },
      { name: "Wikidata", role: "which article is which topic", icon: siWikidata, lane: "both" },
      { name: "ftp.acc.umu.se mirror", role: "bulk downloads, two at a time", badge: "UMU", lane: "both" },
    ],
  },
  {
    title: "Ingest",
    tools: [
      { name: "Python SSE collector", role: "resumable, sanitizes names and IPs", icon: siPython, lane: "both" },
      { name: "GitHub Actions", role: "scheduled runs and the all-language backfill", icon: siGithubactions, lane: "free" },
      { name: "Apache Kafka", role: "KRaft, schema registry with Avro", icon: siApachekafka, lane: "full", local: true },
    ],
  },
  {
    title: "Lakehouse",
    tools: [
      { name: "delta-rs", role: "Delta tables, bronze to gold", badge: "Δ", lane: "free" },
      { name: "DuckDB", role: "the core SQL, run on a laptop or a runner", icon: siDuckdb, lane: "free" },
      { name: "Apache Spark", role: "the same SQL and Structured Streaming", icon: siApachespark, lane: "full", local: true },
      { name: "Databricks", role: "Auto Loader, Lakeflow, Unity Catalog", icon: siDatabricks, lane: "full" },
    ],
  },
  {
    title: "Models and quality",
    tools: [
      { name: "dbt", role: "marts and tests on DuckDB and Databricks", badge: "dbt", lane: "both" },
      { name: "Soda Core", role: "data quality checks", badge: "So", lane: "both" },
      { name: "ODCS contracts", role: "datacontract-cli lint", badge: "DC", lane: "both" },
    ],
  },
  {
    title: "Lineage and observability",
    tools: [
      { name: "OpenLineage and Marquez", role: "job and dataset lineage", badge: "OL", lane: "full" },
      { name: "OpenMetadata", role: "catalog, glossary, lineage", badge: "OM", lane: "full" },
      { name: "OpenTelemetry", role: "pipeline traces and metrics", icon: siOpentelemetry, lane: "full", local: true },
      { name: "Prometheus", role: "metrics store", icon: siPrometheus, lane: "full", local: true },
      { name: "Grafana", role: "events per second, latency, lag", icon: siGrafana, lane: "full", local: true },
    ],
  },
  {
    title: "Publish",
    tools: [
      { name: "JSON exports", role: "versioned, schema-checked, every run", icon: siJson, lane: "both" },
      { name: "GitHub release", role: "the site-data files this site reads", icon: siGithub, lane: "both" },
      { name: "OpenRouter", role: "weekly report, free models, numbers checked", icon: siOpenrouter, lane: "free" },
      { name: "Next.js", role: "this static site", icon: siNextdotjs, lane: "both" },
      { name: "GitHub Pages", role: "hosting, rebuilt hourly", icon: siGithubpages, lane: "both" },
    ],
  },
];

const ORCHESTRATION: Tool[] = [
  { name: "GitHub Actions", role: "production schedule", icon: siGithubactions, lane: "free" },
  { name: "Databricks Jobs", role: "deployed by an Asset Bundle", icon: siDatabricks, lane: "full" },
  { name: "Dagster", role: "the asset graph", badge: "Dg", lane: "full" },
];

const LANE = { free: "free", full: "full", both: "free and full" } as const;

function Logo({ t }: { t: Tool }) {
  return (
    <span className="tool-logo" style={{ "--brand": `#${t.icon?.hex ?? "888888"}` } as React.CSSProperties} aria-hidden="true">
      {t.icon ? (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d={t.icon.path} />
        </svg>
      ) : (
        <b>{t.badge}</b>
      )}
    </span>
  );
}

function Chip({ t }: { t: Tool }) {
  return (
    <li className={`tool lane-${t.lane}`} tabIndex={0}>
      <Logo t={t} />
      <span className="tool-text">
        <b>{t.name}</b>
        <span className="tool-role">{t.role}</span>
        <span className="tool-tags">
          <span className={`tag ${t.lane}`}>{LANE[t.lane]}</span>
          {t.local ? <span className="tag local">local stack</span> : null}
        </span>
      </span>
    </li>
  );
}

export function Architecture() {
  return (
    <figure className="arch" aria-labelledby="arch-cap">
      <ol className="arch-flow">
        {STAGES.map((s) => (
          <li className="arch-stage" key={s.title}>
            <h3>{s.title}</h3>
            <ul>
              {s.tools.map((t) => (
                <Chip t={t} key={t.name} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <div className="arch-orch">
        <h3>Orchestration</h3>
        <ul>
          {ORCHESTRATION.map((t) => (
            <Chip t={t} key={t.name} />
          ))}
        </ul>
      </div>
      <figcaption id="arch-cap" className="key">
        Data flows left to right (top to bottom on a phone). <span className="tag free">free</span> is the production
        profile that runs on GitHub Actions at no cost; <span className="tag full">full</span> is the showcase profile
        on Databricks and a self-hosted stack; both run the same SQL. <span className="tag local">local stack</span>{" "}
        marks tools verified on the local Docker stack only. Logos: Simple Icons (CC<S>0</S>); lettered badges where no
        logo is available.
      </figcaption>
    </figure>
  );
}
