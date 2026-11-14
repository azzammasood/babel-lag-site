import type { Metadata } from "next";
import Link from "next/link";
import { Native } from "@/components/Native";
import { Page, Unavailable } from "@/components/Page";
import { V } from "@/components/V";
import { byLag, languages } from "@/lib/data";
import { english } from "@/lib/names";

export const metadata: Metadata = { title: "Languages" };
const F = "languages.json";

export default function Languages() {
  const env = languages();
  return (
    <Page
      eyebrow="Languages"
      title="The Babel Lag index"
      lede="Every language in the slice, from the shortest median wait to the longest. Lag is the time from a topic's first article in the reference set to its article in this language."
    >
      {!env ? (
        <Unavailable file={F} />
      ) : (
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Language</th>
                <th className="r">Median lag (years)</th>
                <th className="r">Coverage %</th>
                <th className="r">Topics covered</th>
                <th className="r">Covered first</th>
                <th className="r">Pageviews</th>
              </tr>
            </thead>
            <tbody>
              {byLag(env.rows).map((r) => (
                <tr key={r.language}>
                  <td>
                    <Link href={`/languages/${r.language}/`}>
                      <Native code={r.language} /> {english(r.language)}
                    </Link>
                  </td>
                  <td className="r">
                    <V file={F} ptr={`/rows/${r.i}/median_lag_days`} as="years" />
                  </td>
                  <td className="r">
                    <V file={F} ptr={`/rows/${r.i}/coverage_pct`} as="raw" />
                  </td>
                  <td className="r">
                    <V file={F} ptr={`/rows/${r.i}/items_covered`} />
                  </td>
                  <td className="r">
                    <V file={F} ptr={`/rows/${r.i}/items_first`} />
                  </td>
                  <td className="r">
                    <V file={F} ptr={`/rows/${r.i}/pageviews`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="key">
        Median lag is taken over topics the language covered after another language. Coverage is the share of
        reference topics with an eligible article. Pageviews are human views of covered topics over the slice days.
      </p>
    </Page>
  );
}
