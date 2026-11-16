import Link from "next/link";
import { Names } from "@/components/Native";
import { Empty } from "@/components/Page";
import { S, V } from "@/components/V";
import { spreading, wikiLang } from "@/lib/data";

const F = "spreading.json";

// Live topic tracking: topics that gained new articles in two or more languages in the window.
// An empty table is a valid answer and is shown as one.
export function Spreading() {
  const env = spreading();
  if (!env) {
    return (
      <Empty title="Not published in this build.">
        The data this build was made from has no live topic tracking file, so nothing is shown here.
      </Empty>
    );
  }
  const groups = new Map<number, { wiki: string; lag_hours: number; i: number }[]>();
  env.rows.forEach((r, i) => groups.set(r.item_id, [...(groups.get(r.item_id) ?? []), { wiki: r.wiki, lag_hours: r.lag_hours, i }]));
  for (const g of groups.values()) g.sort((a, b) => a.lag_hours - b.lag_hours || a.wiki.localeCompare(b.wiki));
  return (
    <>
      <p className="small muted">
        Topics with new articles in two or more languages in the last <S>48</S> hours · checked{" "}
        <V file={F} ptr="/generated_at" as="date" /> UTC
      </p>
      {groups.size === 0 ? (
        <Empty title="No topic is spreading to a second language right now.">
          In the last <S>48</S> hours no topic gained new articles in two or more languages that could be matched. That
          is a real answer, not missing data.
        </Empty>
      ) : (
        <div className="grid2">
          {[...groups.entries()].map(([id, g]) => (
            <div className="card on" key={id}>
              <b>
                <a href={`https://www.wikidata.org/wiki/Q${id}`}>
                  Q<V file={F} ptr={`/rows/${g[0]!.i}/item_id`} as="raw" />
                </a>
              </b>{" "}
              <span className="small muted">
                now in <V file={F} ptr={`/rows/${g[0]!.i}/languages`} /> languages
              </span>
              <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0", fontSize: 14 }}>
                {g.map((r) => (
                  <li key={r.wiki}>
                    <Link href={`/languages/${wikiLang(r.wiki)}/`}>
                      <Names code={wikiLang(r.wiki)} />
                    </Link>{" "}
                    <span className="muted">
                      +<V file={F} ptr={`/rows/${r.i}/lag_hours`} as="f1" /> hours
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <p className="key">
        New articles are matched to their topic through Wikidata, which is often linked hours after an article
        appears; articles linked later than the window, or beyond the lookup budget of a run, are missed.
      </p>
    </>
  );
}
