import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Names } from "@/components/Native";
import { Empty, Page } from "@/components/Page";
import { S, V } from "@/components/V";
import { byLag, derived, languages } from "@/lib/data";
import { english } from "@/lib/names";

const F = "languages.json";
const D = "derived.json";
type Props = { params: Promise<{ code: string }> };

export function generateStaticParams() {
  const rows = languages()?.rows ?? [];
  // A build without languages.json still needs one path for the static export.
  return rows.length ? rows.map((r) => ({ code: r.language })) : [{ code: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: english(code) };
}

export default async function Language({ params }: Props) {
  const { code } = await params;
  const env = languages();
  const ranked = env ? byLag(env.rows) : [];
  const pos = ranked.findIndex((r) => r.language === code);
  const r = ranked[pos];
  if (!env || !r) notFound();
  const live = derived()?.by_wiki[r.wiki];
  const p = `/rows/${r.i}`;
  const w = `/by_wiki/${r.wiki}`;
  return (
    <Page
      eyebrow="Language"
      title={
        <Names code={code} />
      }
      lede={
        <>
          Floor <S>{pos + 1}</S> of <V file={F} ptr="/row_count" as="raw" /> in the tower, counting from the base
          (the shortest wait). Reference set: <V file={F} ptr={`${p}/reference_set`} as="raw" />.
        </>
      }
    >
      <div className="grid2">
        <div className="stat">
          <div className="v">
            <V file={F} ptr={`${p}/median_lag_days`} as="years" /> yrs
          </div>
          <div className="k">
            median coverage lag (<V file={F} ptr={`${p}/median_lag_days`} as="f1" /> days)
          </div>
        </div>
        <div className="stat">
          <div className="v">
            <V file={F} ptr={`${p}/coverage_pct`} as="raw" />%
          </div>
          <div className="k">of the shared reference topics have an article</div>
        </div>
        <div className="stat">
          <div className="v">
            <V file={F} ptr={`${p}/items_covered`} />
          </div>
          <div className="k">topics covered</div>
        </div>
        <div className="stat">
          <div className="v">
            <V file={F} ptr={`${p}/items_first`} />
          </div>
          <div className="k">topics this language covered first</div>
        </div>
        <div className="stat">
          <div className="v">
            <V file={F} ptr={`${p}/median_depth_ratio`} as="raw" />
          </div>
          <div className="k">
            coverage depth: median article size relative to the topic&apos;s first article (below one means shorter)
          </div>
        </div>
        <div className="stat">
          <div className="v">
            <V file={F} ptr={`${p}/pageviews`} />
          </div>
          <div className="k">human pageviews of covered topics over the measured days</div>
        </div>
        <div className="stat">
          <div className="v">
            <V file={F} ptr={`${p}/demand_without_supply`} />
          </div>
          <div className="k">
            demand without supply (proxy): views, in all languages, of reference topics this language has no article
            for
          </div>
        </div>
      </div>
      <p className="key">
        Demand without supply measures interest in topics this language does not cover. It is not a count of searches
        made in this language: Wikimedia publishes no search logs by language.
      </p>

      <h2>Live, over the measured window</h2>
      {live ? (
        <div className="grid2">
          <div className="stat">
            <div className="v">
              <V file={D} ptr={`${w}/new_articles`} />
            </div>
            <div className="k">new articles on {r.wiki}</div>
          </div>
          <div className="stat">
            <div className="v">
              <V file={D} ptr={`${w}/human_article_edits`} />
            </div>
            <div className="k">human article edits</div>
          </div>
          <div className="stat">
            <div className="v">
              <V file={D} ptr={`${w}/events`} />
            </div>
            <div className="k">events of every kind</div>
          </div>
        </div>
      ) : (
        <Empty title="No live events measured.">The collector heard nothing from {r.wiki} in this window.</Empty>
      )}
      <p className="key">Live figures are sums of the hourly rows of live.json for this wiki.</p>

      <p style={{ marginTop: 18 }}>
        <Link href="/languages/">All languages</Link>
      </p>
    </Page>
  );
}
