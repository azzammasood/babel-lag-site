import type { Metadata } from "next";
import Link from "next/link";
import { Names } from "@/components/Native";
import { S, V } from "@/components/V";
import { languages, report } from "@/lib/data";

export const metadata: Metadata = { title: "Weekly report" };
const F = "report.json";
const LF = "languages.json";
const MIN_TOPICS = 10000; // the report's own rule for the lag lists

// The report text, sentence by sentence, with every number and language code marked. The outer span
// carries the source, and its text is exactly the export's, so the trace check still compares it.
function Marked({ text }: { text: string }) {
  // Split after ".", "!" or "?" followed by a space and a capital letter; keep every character, so
  // the sentences joined give back the text exactly.
  const parts = text.split(/(?<=[.!?])(\s+)(?=[A-Z])/);
  const sentences: string[] = [];
  for (let j = 0; j < parts.length; j += 2) sentences.push(parts[j]! + (parts[j + 1] ?? ""));
  let k = 0;
  return (
    <span data-src={`${F}#/rows/0/text`} data-as="raw" className="wire-text">
      {sentences.map((s, i) => (
        <span key={i} className={i === 0 ? "wire-lede" : "wire-sent"}>
          {s.split(/(\d[\d,]*(?:\.\d+)?%?|\([a-z-]{2,12}\))/).map((part) =>
            /^\d/.test(part) ? (
              <mark key={k++} className="wire-num">
                {part}
              </mark>
            ) : /^\([a-z-]+\)$/.test(part) ? (
              <span key={k++} className="wire-code">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </span>
      ))}
    </span>
  );
}

export default function Report() {
  const doc = report();
  const env = languages();
  const rows = (env?.rows ?? []).map((r, i) => ({ ...r, i }));
  const big = rows.filter((r) => r.items_covered >= MIN_TOPICS);
  type Row = (typeof rows)[number];
  const most = rows.reduce<Row | null>((a, r) => (!a || r.items_covered > a.items_covered ? r : a), null);
  const fast = big.reduce<Row | null>((a, r) => (!a || r.median_lag_days < a.median_lag_days ? r : a), null);
  const slow = big.reduce<Row | null>((a, r) => (!a || r.median_lag_days > a.median_lag_days ? r : a), null);
  const maxLag = slow?.median_lag_days ?? 1;
  const cards = [
    { title: "Most covered", r: most, covered: true },
    { title: "Shortest wait", r: fast, covered: false },
    { title: "Longest wait", r: slow, covered: false },
  ];

  return (
    <div className="wrap page wire">
      <header className="wire-mast">
        <div className="wire-rule" aria-hidden="true" />
        <p className="wire-kicker">The Babel Wire</p>
        <h1>This week, in words</h1>
        {doc ? (
          <p className="wire-meta">
            <span>
              Facts of <V file={F} ptr="/rows/0/facts_date" as="day" />
            </span>
            <span className="badge ai">AI-written</span>
            <span className="badge ok">✓ every number checked</span>
          </p>
        ) : null}
        <div className="wire-rule" aria-hidden="true" />
      </header>

      {doc && doc.rows[0] ? (
        <div className="wire-grid">
          <article className="wire-story">
            <p className="wire-body">
              <Marked text={doc.rows[0].text} />
            </p>
            <footer className="wire-sign small muted">
              Written by{" "}
              <code>
                <V file={F} ptr="/rows/0/model" as="raw" />
              </code>
              , a free model, from facts the pipeline computed (fingerprint{" "}
              <code>
                <V file={F} ptr="/rows/0/facts_sha" as="raw" />
              </code>
              ). A text whose numbers, language codes or rankings do not match those facts is not published.{" "}
              <Link href="/method/">How it is checked</Link>.
            </footer>
          </article>

          <aside className="wire-side" aria-label="The week in three numbers">
            <p className="wire-side-title">The week in three numbers</p>
            {cards.map(({ title, r, covered }) =>
              r ? (
                <div className="wire-card" key={title}>
                  <p className="eyebrow">{title}</p>
                  <Link href={`/languages/${r.language}/`} className="wire-lang">
                    <Names code={r.language} />
                  </Link>
                  {covered ? (
                    <p className="wire-big">
                      <V file={LF} ptr={`/rows/${r.i}/items_covered`} />
                      <small> topics covered</small>
                    </p>
                  ) : (
                    <p className="wire-big">
                      <V file={LF} ptr={`/rows/${r.i}/median_lag_days`} as="years" />
                      <small> years median wait</small>
                    </p>
                  )}
                  <span className="wire-meter" aria-hidden="true">
                    <i style={{ width: `${Math.max(2, (100 * r.median_lag_days) / maxLag).toFixed(1)}%` }} />
                  </span>
                  <p className="small muted">
                    <V file={LF} ptr={`/rows/${r.i}/coverage_pct`} as="raw" />% of shared topics ·{" "}
                    <V file={LF} ptr={`/rows/${r.i}/median_lag_days`} as="years" /> yrs wait
                  </p>
                </div>
              ) : null,
            )}
            <p className="small muted">
              Waits compare languages with at least <S>10,000</S> topics, the rule the report uses. The bar is each
              wait against the longest of the three.
            </p>
          </aside>
        </div>
      ) : (
        <div className="empty" role="note">
          <b>No report has been published yet.</b> The method page explains how one is written and checked.
        </div>
      )}
      <p className="key">Lag is measured on Wikipedia only; it says nothing about other media in a language.</p>
    </div>
  );
}
