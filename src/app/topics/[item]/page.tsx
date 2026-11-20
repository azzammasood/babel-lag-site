import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Names } from "@/components/Native";
import { Page } from "@/components/Page";
import { Searchable } from "@/components/Searchable";
import { V } from "@/components/V";
import { english, native } from "@/lib/names";
import { backtests, byItem, wikiLang } from "@/lib/data";

const F = "backtests.json";
type Props = { params: Promise<{ item: string }> };

export function generateStaticParams() {
  const env = backtests();
  const ids = env ? [...byItem(env.rows).keys()] : [];
  // A build without backtests.json still needs one path for the static export.
  return ids.length ? ids.map((id) => ({ item: String(id) })) : [{ item: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { item } = await params;
  return { title: `Topic Q${item}` };
}

export default async function Topic({ params }: Props) {
  const { item } = await params;
  const env = backtests();
  const g = env ? byItem(env.rows).get(Number(item)) : undefined;
  if (!g || g.length === 0) notFound();
  const first = g[0]!;
  const max = g[g.length - 1]!.lag_days || 1;
  return (
    <Page
      eyebrow="Topic"
      title={
        <>
          Topic Q<V file={F} ptr={`/rows/${first.i}/item_id`} as="raw" />
        </>
      }
      lede={
        <>
          First written in <Names code={wikiLang(first.wiki)} /> on{" "}
          <V file={F} ptr={`/rows/${first.i}/first_created_at`} as="date" /> UTC. Today it has an article in{" "}
          <V file={F} ptr={`/rows/${first.i}/languages`} /> languages.
        </>
      }
    >
      <p>
        <a href={`https://www.wikidata.org/wiki/Q${first.item_id}`}>See what this topic is on Wikidata</a>. Titles are
        not part of the export, so the topic is shown by its item number.
      </p>
      <Searchable label="Languages for this topic" placeholder="Search languages" height="min(64vh, 560px)">
        <table className="sticky">
          <thead>
            <tr>
              <th>Language</th>
              <th>Article created (UTC)</th>
              <th className="r">Lag (days)</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {g.map((r) => (
              <tr
                key={r.wiki}
                data-row=""
                data-search={`${english(wikiLang(r.wiki))} ${native(wikiLang(r.wiki))} ${wikiLang(r.wiki)}`}
              >
                <td>
                  <Link href={`/languages/${wikiLang(r.wiki)}/`}>
                    <Names code={wikiLang(r.wiki)} />
                  </Link>
                </td>
                <td>
                  <V file={F} ptr={`/rows/${r.i}/created_at`} as="date" />
                </td>
                <td className="r">
                  <V file={F} ptr={`/rows/${r.i}/lag_days`} as="f1" />
                </td>
                <td aria-hidden="true">
                  <span className="lagbar">
                    <i style={{ width: `${((100 * r.lag_days) / max).toFixed(1)}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Searchable>
      <p className="key">
        Lag is the article&apos;s creation time minus the first article&apos;s. The bar is the lag relative to the
        longest on this page.
      </p>
      <p>
        <Link href="/backtests/">All backtest topics</Link>
      </p>
    </Page>
  );
}
