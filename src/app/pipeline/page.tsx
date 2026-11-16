import type { Metadata } from "next";
import { HourColumns } from "@/components/HourColumns";
import { Page, Unavailable } from "@/components/Page";
import { V } from "@/components/V";
import { derived, metrics } from "@/lib/data";
import { FMT } from "@/lib/format";

export const metadata: Metadata = { title: "Pipeline Live" };
const M = "pipeline_metrics.json";
const D = "derived.json";

function Stat({ children, k }: { children: React.ReactNode; k: React.ReactNode }) {
  return (
    <div className="stat">
      <div className="v">{children}</div>
      <div className="k">{k}</div>
    </div>
  );
}

export default function Pipeline() {
  const m = metrics();
  const d = derived();
  if (!m) {
    return (
      <Page eyebrow="Pipeline Live" title="Pipeline Live">
        <Unavailable file={M} />
      </Page>
    );
  }
  const peak = d?.peak_hour_events ?? 0;
  return (
    <Page
      eyebrow="Pipeline Live"
      title={
        <>
          Laid course by course, <em>hour by hour</em>.
        </>
      }
      lede="Everything the pipeline reported about itself in its last run. Every figure on this page is read from pipeline_metrics.json or summed from live.json; nothing is estimated."
    >
      <p className="small muted">
        Profile{" "}
        <b>
          <V file={M} ptr="/profile/produced_by" as="raw" />
        </b>
        {m.profile.fallback ? " (fallback)" : ""} · reason: <V file={M} ptr="/profile/reason" as="raw" /> · published{" "}
        <V file={M} ptr="/freshness/published_at" as="date" /> UTC
      </p>

      <div className="grid2">
        <Stat k="events per second in the last measured window">
          <V file={M} ptr="/live/events_per_second" as="f1" />
        </Stat>
        <Stat k="seconds from an event to the published table">
          <V file={M} ptr="/live/end_to_end_latency_s" as="f1" />
        </Stat>
        <Stat k="events ingested in total">
          <V file={M} ptr="/totals/events" />
        </Stat>
        <Stat k="wikis heard">
          <V file={M} ptr="/totals/wikis" />
        </Stat>
        <Stat k="rows of edit history">
          <V file={M} ptr="/totals/history_rows" />
        </Stat>
        <Stat k="gigabytes ingested">
          <V file={M} ptr="/totals/bytes" as="gb" />
        </Stat>
        <Stat k="cost of the run, US dollars">
          <V file={M} ptr="/cost/usd" as="raw" />
        </Stat>
        <Stat k="languages with history">
          <V file={M} ptr="/totals/languages" />
        </Stat>
      </div>
      <p className="key">
        Quota: <V file={M} ptr="/cost/free_quota_note" as="raw" />
      </p>

      <h2>The live stream, one column per measured hour</h2>
      {d && d.hourly.length ? (
        <>
          <HourColumns
            heights={d.hourly.map((h) => Math.round(8 + (230 * h.events) / (peak || 1)))}
            labels={d.hourly.map((h) => `${FMT.hour(h.hour)} UTC`)}
            label="Columns of events per measured hour, oldest first. The same values are in the table below."
          />
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Hour (UTC)</th>
                  <th className="r">Events</th>
                  <th className="r">New articles</th>
                  <th className="r">Human article edits</th>
                  <th className="r">Bot events</th>
                  <th className="r">Late events</th>
                  <th className="r">Wikis active</th>
                </tr>
              </thead>
              <tbody>
                {d.hourly.map((h, i) => (
                  <tr key={h.hour}>
                    <td>
                      <V file={D} ptr={`/hourly/${i}/hour`} as="hour" />
                    </td>
                    {(["events", "new_articles", "human_article_edits", "bot_events", "late_events", "wikis_active"] as const).map(
                      (k) => (
                        <td className="r" key={k}>
                          <V file={D} ptr={`/hourly/${i}/${k}`} />
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="key">Sums of live.json rows by hour, across every wiki heard.</p>
        </>
      ) : (
        <Unavailable file="live.json" />
      )}

      <h2>Services</h2>
      <p className="muted">
        Each service the pipeline can use, and whether it ran in the last measured run. A tool is listed only with
        evidence that it ran at some point.
      </p>
      <div className="grid2">
        {m.engines.map((e, i) => (
          <div className={`card${e.active ? " on" : ""}`} key={e.name}>
            <b>
              <V file={M} ptr={`/engines/${i}/name`} as="raw" />
            </b>{" "}
            <span className="muted">
              <V file={M} ptr={`/engines/${i}/version`} as="raw" />
            </span>
            <br />
            <span className="small">
              <V file={M} ptr={`/engines/${i}/role`} as="raw" />
            </span>
            <br />
            <span className="small">
              {e.active ? <b>ran in the last run</b> : <span className="muted">not in the last run</span>} · last used{" "}
              <V file={M} ptr={`/engines/${i}/last_used`} as="date" />
            </span>
          </div>
        ))}
      </div>

      <h2>Last run</h2>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Service</th>
              <th className="r">Records in</th>
              <th className="r">Records out</th>
              <th className="r">Seconds</th>
              <th className="r">Records per second</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {m.last_run.stages.map((s, i) => (
              <tr key={i}>
                <td>
                  <V file={M} ptr={`/last_run/stages/${i}/stage`} as="raw" />
                </td>
                <td>
                  <V file={M} ptr={`/last_run/stages/${i}/service`} as="raw" />{" "}
                  <V file={M} ptr={`/last_run/stages/${i}/version`} as="raw" />
                </td>
                <td className="r">
                  <V file={M} ptr={`/last_run/stages/${i}/records_in`} />
                </td>
                <td className="r">
                  <V file={M} ptr={`/last_run/stages/${i}/records_out`} />
                </td>
                <td className="r">
                  <V file={M} ptr={`/last_run/stages/${i}/seconds`} as="raw" />
                </td>
                <td className="r">
                  <V file={M} ptr={`/last_run/stages/${i}/records_per_second`} as="f1" />
                </td>
                <td>
                  <V file={M} ptr={`/last_run/stages/${i}/status`} as="raw" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Run history</h2>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Run ended (UTC)</th>
              <th>Status</th>
              <th className="r">Events</th>
              <th className="r">Seconds</th>
            </tr>
          </thead>
          <tbody>
            {m.history.runs
              .map((r, i) => (
                <tr key={r.run_id}>
                  <td>
                    <V file={M} ptr={`/history/runs/${i}/ended_at`} as="date" />
                  </td>
                  <td>
                    {r.status === "ok" ? "✓ " : "✕ "}
                    <V file={M} ptr={`/history/runs/${i}/status`} as="raw" />
                  </td>
                  <td className="r">
                    <V file={M} ptr={`/history/runs/${i}/events`} />
                  </td>
                  <td className="r">
                    <V file={M} ptr={`/history/runs/${i}/seconds`} as="f1" />
                  </td>
                </tr>
              ))
              .reverse()}
          </tbody>
        </table>
      </div>

      <h2>Quality and freshness</h2>
      <div className="grid2">
        <Stat k="rows quarantined">
          <V file={M} ptr="/quality/quarantined_rows" />
        </Stat>
        <Stat k="contract violations">
          <V file={M} ptr="/quality/contract_violations" />
        </Stat>
        <Stat k="quality checks passed">
          <V file={M} ptr="/quality/checks_passed" />
        </Stat>
        <Stat k="lineage nodes documented, percent">
          <V file={M} ptr="/lineage_summary/documented_pct" as="f1" />
        </Stat>
      </div>
      <p className="key">
        Latest event in the data: <V file={M} ptr="/freshness/latest_event_at" as="date" /> UTC. Reconnects and
        consumer lag: <V file={M} ptr="/live/reconnects" /> and <V file={M} ptr="/live/consumer_lag" />.
      </p>
    </Page>
  );
}
