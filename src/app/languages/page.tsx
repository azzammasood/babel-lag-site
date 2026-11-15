import type { Metadata } from "next";
import Link from "next/link";
import { Names } from "@/components/Native";
import { Page, Unavailable } from "@/components/Page";
import { V } from "@/components/V";
import { byLag, languages } from "@/lib/data";

export const metadata: Metadata = { title: "Languages" };
const F = "languages.json";

export default function Languages() {
  const env = languages();
  return (
    <Page
      eyebrow="Languages"
      title="The Babel Lag index"
      lede="Every Wikipedia language, from the shortest median wait to the longest. Lag is the time from a topic's first article in the reference set to its article in this language."
    >
      {!env ? (
        <Unavailable file={F} />
      ) : (
        <>
          <p className="small muted">
            <V file={F} ptr="/row_count" as="raw" /> languages · reference set:{" "}
            <V file={F} ptr="/rows/0/reference_set" as="raw" /> · generated{" "}
            <V file={F} ptr="/generated_at" as="date" /> UTC
          </p>
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Language</th>
                  <th className="r">Median lag (years)</th>
                  <th className="r">Coverage %</th>
                  <th className="r">Depth ratio</th>
                  <th className="r">Topics covered</th>
                  <th className="r">Covered first</th>
                  <th className="r">Demand without supply (proxy)</th>
                </tr>
              </thead>
              <tbody>
                {byLag(env.rows).map((r) => (
                  <tr key={r.language}>
                    <td>
                      <Link href={`/languages/${r.language}/`}>
                        <Names code={r.language} />
                      </Link>
                    </td>
                    <td className="r">
                      <V file={F} ptr={`/rows/${r.i}/median_lag_days`} as="years" />
                    </td>
                    <td className="r">
                      <V file={F} ptr={`/rows/${r.i}/coverage_pct`} as="raw" />
                    </td>
                    <td className="r">
                      <V file={F} ptr={`/rows/${r.i}/median_depth_ratio`} as="raw" />
                    </td>
                    <td className="r">
                      <V file={F} ptr={`/rows/${r.i}/items_covered`} />
                    </td>
                    <td className="r">
                      <V file={F} ptr={`/rows/${r.i}/items_first`} />
                    </td>
                    <td className="r">
                      <V file={F} ptr={`/rows/${r.i}/demand_without_supply`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="key">
        Median lag is taken over topics the language covered after another language. Coverage is the share of
        reference topics with an eligible article. Depth ratio is the median size of the article relative to the
        topic&apos;s first article (below one means shorter). Demand without supply is a proxy: views, in all
        languages, of reference topics this language has no article for. It measures interest in topics the language
        does not cover, not searches made in that language.
      </p>
    </Page>
  );
}
