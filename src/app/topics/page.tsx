import type { Metadata } from "next";
import Link from "next/link";
import { Names } from "@/components/Native";
import { Empty, Page } from "@/components/Page";
import { V } from "@/components/V";
import { backtests, byItem, wikiLang } from "@/lib/data";

export const metadata: Metadata = { title: "Topics" };
const F = "backtests.json";

export default function Topics() {
  const env = backtests();
  const items = env ? [...byItem(env.rows).entries()] : [];
  return (
    <Page
      eyebrow="Topics"
      title="One topic, spreading"
      lede="For a single topic: the day its first article was written, and the day each other language caught up."
    >
      <Empty title="Live topic tracking is not delivered.">
        Following a brand-new topic across languages as it happens is not part of this release. The topics below are
        past ones, chosen by the fixed rule on the Backtests page.
      </Empty>
      {items.length === 0 ? (
        <p className="muted" style={{ marginTop: 14 }}>
          No per-topic data has been published in the data this build was made from.
        </p>
      ) : (
        <div className="grid2" style={{ marginTop: 16 }}>
          {items.map(([id, g]) => {
            const first = g[0]!;
            return (
              <Link className="card" href={`/topics/${id}/`} key={id}>
                <b>
                  Q<V file={F} ptr={`/rows/${first.i}/item_id`} as="raw" />
                </b>
                <br />
                <span className="small">
                  first written in <Names code={wikiLang(first.wiki)} />,{" "}
                  <V file={F} ptr={`/rows/${first.i}/first_created_at`} as="day" /> · now in{" "}
                  <V file={F} ptr={`/rows/${first.i}/languages`} /> languages
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Page>
  );
}
