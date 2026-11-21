import { S } from "@/components/V";

// Tool logos are bundled in public/logos (sources and licences in public/logos/CREDITS.txt);
// nothing is hot-linked. Every tool here is one the pipeline recorded doing real work
// (README "What produced the current data" and docs/claims-audit.md).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Tool = { name: string; role: string; logo: string; wide?: boolean };
type Stage = { title: string; tools: Tool[] };

const STAGES: Stage[] = [
  {
    title: "Sources",
    tools: [
      { name: "Wikimedia EventStreams", role: "every live change on every wiki", logo: "wikimedia.svg" },
      { name: "MediaWiki history dumps", role: "every revision of every article", logo: "wikipedia.svg" },
      { name: "Pageview dumps", role: "human views per article and day", logo: "wikipedia.svg" },
      { name: "Wikidata", role: "which article is which topic", logo: "wikidata.svg" },
      { name: "ftp.acc.umu.se mirror", role: "bulk downloads, two at a time", logo: "mirror.svg" },
    ],
  },
  {
    title: "Ingest",
    tools: [
      { name: "Python SSE collector", role: "resumable; drops names and IPs on arrival", logo: "python.svg" },
      { name: "Apache Kafka", role: "KRaft and a schema registry with Avro", logo: "kafka.svg" },
      { name: "GitHub Actions", role: "scheduled catch-up and the all-language backfill", logo: "github-actions.svg" },
    ],
  },
  {
    title: "Store",
    tools: [
      { name: "Delta Lake (delta-rs)", role: "bronze, silver and gold Delta tables", logo: "delta-lake.svg" },
      { name: "Databricks Unity Catalog", role: "volumes, Auto Loader, governed tables", logo: "databricks.svg" },
    ],
  },
  {
    title: "Transform",
    tools: [
      { name: "DuckDB", role: "the core SQL: lag, depth, demand, live", logo: "duckdb.svg" },
      { name: "Apache Spark", role: "the same SQL, and Structured Streaming", logo: "spark.svg" },
      { name: "Databricks Lakeflow", role: "declarative pipeline with expectations", logo: "databricks.svg" },
      { name: "dbt", role: "marts and tests on DuckDB and Databricks", logo: "dbt.svg" },
    ],
  },
  {
    title: "Quality and lineage",
    tools: [
      { name: "Soda Core", role: "data quality checks", logo: "soda.png" },
      { name: "ODCS contracts", role: "checked with datacontract-cli", logo: "datacontract.svg" },
      { name: "OpenLineage", role: "lineage events from every job", logo: "openlineage.svg", wide: true },
      { name: "Marquez", role: "the lineage graph", logo: "marquez.svg" },
      { name: "OpenMetadata", role: "catalog, glossary, lineage", logo: "openmetadata.svg" },
    ],
  },
  {
    title: "Observe",
    tools: [
      { name: "OpenTelemetry", role: "pipeline traces and metrics", logo: "opentelemetry.svg" },
      { name: "Prometheus", role: "the metrics store", logo: "prometheus.svg" },
      { name: "Grafana", role: "events per second, latency, lag", logo: "grafana.svg" },
    ],
  },
  {
    title: "Publish",
    tools: [
      { name: "JSON exports", role: "versioned and schema-checked", logo: "json.svg" },
      { name: "GitHub release", role: "the files this site reads", logo: "github.svg" },
      { name: "OpenRouter", role: "the weekly report, numbers checked", logo: "openrouter.svg" },
      { name: "Next.js", role: "this static site", logo: "nextjs.svg" },
      { name: "GitHub Pages", role: "hosting, rebuilt every hour", logo: "github-pages.svg", wide: true },
    ],
  },
];

const ORCHESTRATION: Tool[] = [
  { name: "GitHub Actions", role: "the production schedule", logo: "github-actions.svg" },
  { name: "Databricks Jobs", role: "deployed by an Asset Bundle", logo: "databricks.svg" },
  { name: "Dagster", role: "the asset graph", logo: "dagster.svg" },
];

function Chip({ t }: { t: Tool }) {
  return (
    <li className="tool" tabIndex={0}>
      <span className={`tool-logo${t.wide ? " wide" : ""}`} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, small bundled logos */}
        <img src={`${BASE}/logos/${t.logo}`} alt="" width={30} height={30} loading="lazy" decoding="async" />
      </span>
      <span className="tool-text">
        <b>{t.name}</b>
        <span className="tool-role">{t.role}</span>
      </span>
    </li>
  );
}

export function Architecture() {
  return (
    <figure className="arch" aria-labelledby="arch-cap">
      <ol className="arch-flow">
        {STAGES.map((s, i) => (
          <li className="arch-stage" key={s.title}>
            <h3>
              <span className="step" aria-hidden="true">
                <S>{i + 1}</S>
              </span>
              {s.title}
            </h3>
            <ul>
              {s.tools.map((t) => (
                <Chip t={t} key={t.name} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <div className="arch-orch">
        <h3>Orchestration, around every stage</h3>
        <ul>
          {ORCHESTRATION.map((t) => (
            <Chip t={t} key={t.name} />
          ))}
        </ul>
      </div>
      <figcaption id="arch-cap" className="key">
        Data flows left to right (top to bottom on a phone). The same SQL runs in two profiles: DuckDB and delta-rs on
        GitHub Actions keep the site updating at no cost, and Spark, Kafka and Databricks show the same work at a
        larger scale. Logos belong to their projects and are used only to name them; sources and licences are listed
        in the site repository.
      </figcaption>
    </figure>
  );
}
