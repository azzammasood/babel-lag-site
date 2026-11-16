import type { Metadata } from "next";
import { Page, Unavailable } from "@/components/Page";
import { V } from "@/components/V";
import { metrics } from "@/lib/data";

export const metadata: Metadata = { title: "How it's built" };
const M = "pipeline_metrics.json";
const PIPE = "https://github.com/azzammasood/babel-lag-pipeline";
const SITE = "https://github.com/azzammasood/babel-lag-site";

export default function Built() {
  const m = metrics();
  return (
    <Page
      eyebrow="How it's built"
      title="One method, two ways to run it"
      lede="The same logic runs on a free profile that keeps this site updating at no cost, and on a full profile that shows the heavier tools doing real work. A tool is named here only if the pipeline recorded it running."
    >
      <div className="prose">
        <h2>The path of the data</h2>
        <ul>
          <li>A collector reads the Wikimedia live streams for every wiki and drops editor names and addresses on the way in.</li>
          <li>Edit history, pageviews and the Wikidata links between languages come from the public dumps.</li>
          <li>Raw data lands in bronze tables, is cleaned into silver, and is reduced to gold tables of facts per topic and language.</li>
          <li>The gold tables are exported as versioned JSON, checked against published schemas, and this site renders only those files.</li>
        </ul>
      </div>

      <h2>Tools with evidence</h2>
      {m ? (
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Tool</th>
                <th>Version</th>
                <th>What it does here</th>
                <th>Last used (UTC)</th>
                <th>In the last run</th>
              </tr>
            </thead>
            <tbody>
              {m.engines.map((e, i) => (
                <tr key={e.name}>
                  <td>
                    <V file={M} ptr={`/engines/${i}/name`} as="raw" />
                  </td>
                  <td>
                    <V file={M} ptr={`/engines/${i}/version`} as="raw" />
                  </td>
                  <td>
                    <V file={M} ptr={`/engines/${i}/role`} as="raw" />
                  </td>
                  <td>
                    <V file={M} ptr={`/engines/${i}/last_used`} as="date" />
                  </td>
                  <td>{e.active ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Unavailable file={M} />
      )}
      <p className="key">
        The data on this site was produced by the{" "}
        <b>{m ? <V file={M} ptr="/profile/produced_by" as="raw" /> : "unknown"}</b> profile.
      </p>

      <div className="prose">
        <h2>The site</h2>
        <p>
          A static site: every page is built ahead of time from the exports. Each figure carries the file and field
          it came from, and an automated check compares every figure on every page with the export before a build is
          accepted. Pages are also checked for accessibility in light and dark.
        </p>
        <h2>Code</h2>
        <ul>
          <li>
            <a href={PIPE}>Pipeline repository</a>: collector, parsers, SQL, data models, contracts and exports.
          </li>
          <li>
            <a href={`${PIPE}/blob/main/docs/DECISIONS.md`}>Decisions</a> and{" "}
            <a href={`${PIPE}/blob/main/docs/method.md`}>method</a>.
          </li>
          <li>
            <a href={SITE}>Site repository</a>.
          </li>
        </ul>
        <p className="muted">
          Model documentation (dbt docs) and benchmarks are published with the next pipeline milestone and will be
          linked here.
        </p>
      </div>
    </Page>
  );
}
