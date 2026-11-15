import type { Metadata } from "next";
import Link from "next/link";
import { Names } from "@/components/Native";
import { Empty, Page } from "@/components/Page";
import { S, V } from "@/components/V";
import { backtests, byItem, wikiLang } from "@/lib/data";

export const metadata: Metadata = { title: "Backtests" };
const F = "backtests.json";

export default function Backtests() {
  const env = backtests();
  const items = env ? [...byItem(env.rows).entries()] : [];
  return (
    <Page
      eyebrow="Backtests"
      title="Does the lag show up on real, recent topics?"
      lede="The median lag is a summary. These are individual topics, chosen by a rule fixed before looking at the results, with every language's actual wait."
    >
      <div className="prose">
        <p>
          <b>The rule:</b> the topics whose first eligible article was created between <S>2020-01-01</S> and{" "}
          <S>2024-12-31</S> (UTC) and that exist in the most languages today, ties broken by item number. For each one,
          the lag of every language that now has an article.
        </p>
      </div>
      {!env || items.length === 0 ? (
        <Empty title="Not published yet.">
          The pipeline has not published backtests.json in the data this build was made from. Nothing is shown in its
          place.
        </Empty>
      ) : (
        <>
          <p className="small muted">
            <V file={F} ptr="/row_count" as="raw" /> rows · generated <V file={F} ptr="/generated_at" as="date" /> UTC
          </p>
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Topic (Wikidata item)</th>
                  <th>First article in</th>
                  <th>First article created (UTC)</th>
                  <th className="r">Languages today</th>
                  <th>Last to arrive</th>
                  <th className="r">Its lag (days)</th>
                </tr>
              </thead>
              <tbody>
                {items.map(([id, g]) => {
                  const first = g[0]!;
                  const last = g[g.length - 1]!;
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/topics/${id}/`}>
                          Q<V file={F} ptr={`/rows/${first.i}/item_id`} as="raw" />
                        </Link>
                      </td>
                      <td>
                        <Names code={wikiLang(first.wiki)} />
                      </td>
                      <td>
                        <V file={F} ptr={`/rows/${first.i}/first_created_at`} as="date" />
                      </td>
                      <td className="r">
                        <V file={F} ptr={`/rows/${first.i}/languages`} />
                      </td>
                      <td>
                        <Names code={wikiLang(last.wiki)} />
                      </td>
                      <td className="r">
                        <V file={F} ptr={`/rows/${last.i}/lag_days`} as="f1" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="key">
            Each topic links to its full spread, language by language. Topics are identified by their Wikidata item
            number; titles are not part of the export.
          </p>
        </>
      )}
    </Page>
  );
}
