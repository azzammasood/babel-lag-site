import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { S, V } from "@/components/V";
import { glossary, languages } from "@/lib/data";

export const metadata: Metadata = { title: "Method and data" };
const G = "metadata_glossary.json";
const PIPE = "https://github.com/azzammasood/babel-lag-pipeline";

export default function Method() {
  const g = glossary();
  const env = languages();
  return (
    <Page
      eyebrow="Method and data"
      title="How the lag is measured, and what it cannot tell you"
      lede="Lag is measured on Wikipedia only. It says nothing about other media in a language, and a language with a long lag is not a language without knowledge."
    >
      <div className="prose">
        <h2>Coverage lag</h2>
        <ul>
          <li>A topic is a Wikidata item with at least one Wikipedia article linked to it.</li>
          <li>An article&apos;s creation time is the time of its earliest revision in the history dump.</li>
          <li>
            Left out: redirects, deleted pages, and pages whose first revision was made by a bot. Reverted edits are
            left out of measures that use revisions.
          </li>
          <li>
            For each topic, the start is the earliest eligible article across the reference set. The lag for a
            language is its article&apos;s creation time minus that start. Tied languages all count as first.
          </li>
          <li>
            The median lag of a language is taken over topics that exist in two or more languages and that the
            language covered after another one.
          </li>
          <li>
            The reference set is recorded on every row: <S>slice20</S> (an early slice of twenty languages) or{" "}
            <code>all</code> (every Wikipedia). The Languages page shows which one the current data uses. With a small
            reference set, &quot;first&quot; means first among those languages, not first in the world.
          </li>
        </ul>

        <h2>Coverage depth</h2>
        <p>
          For each topic and language: the current size of the article divided by the size of the topic&apos;s first
          article. Per language, the median over topics it covered after another language. A ratio below one means
          shorter articles than the first language&apos;s.
        </p>

        <h2>Demand without supply (a proxy)</h2>
        <p>
          For a language, the human pageviews, in all languages, of reference topics that language has no eligible
          article for. It measures interest in topics the language does not cover. It is not a count of searches made
          in that language: Wikimedia publishes no search logs by language. Views of redirect titles are not counted.
        </p>

        <h2>Backtests</h2>
        <p>
          The rule was fixed before looking at results: the topics whose first eligible article was created between{" "}
          <S>2020-01-01</S> and <S>2024-12-31</S> (UTC) and that exist in the most languages today, ties broken by
          item number. For each, the creation lag of every language.
        </p>

        <h2>Live layer</h2>
        <ul>
          <li>
            Events come from the Wikimedia EventStreams for every wiki, cleaned at ingestion: no usernames, no IP
            addresses, no edit comments.
          </li>
          <li>Duplicates are dropped on the event id. Late events are counted apart.</li>
          <li>
            New articles are page creations in the article namespace that are not by bots and not redirects. Human
            article edits are non-bot edits in the article namespace. The live layer has no revert signal yet.
          </li>
        </ul>

        <h2>Privacy</h2>
        <p>
          Editor names and IP addresses are dropped at ingestion. Everything published is an aggregate by language,
          topic, wiki and time. No editor is named, ranked or profiled, and a test in the pipeline scans every
          published file for names and addresses.
        </p>

        <h2>Not delivered</h2>
        <ul>
          <li>
            <b>Update lag</b> (edit bursts spreading from the first language to others) is not computed or published.
            It needs daily edit series for every page in every language, which the backfill does not keep.
          </li>
          <li>
            <b>Live tracking of single topics</b> (following a brand-new topic across languages as it happens) is not
            delivered. The live layer counts events by wiki and time only.
          </li>
        </ul>

        <h2>Glossary</h2>
        {g ? (
          <dl>
            {g.terms.map((t, i) => (
              <div key={t.term} style={{ marginBottom: 10 }}>
                <dt>
                  <b>
                    <V file={G} ptr={`/terms/${i}/term`} as="raw" />
                  </b>
                </dt>
                <dd style={{ margin: 0 }}>
                  <V file={G} ptr={`/terms/${i}/definition`} as="raw" />
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="muted">The glossary export is unavailable in this build.</p>
        )}

        <h2>Sources and licences</h2>
        <ul>
          {(env?.sources ?? []).map((s, i) => (
            <li key={s.url}>
              <a href={s.url}>
                <V file="languages.json" ptr={`/sources/${i}/name`} as="raw" />
              </a>
            </li>
          ))}
          <li>
            <a href="https://stream.wikimedia.org/v2/stream/">Wikimedia EventStreams</a> (recent changes, revision
            creations, page creations)
          </li>
        </ul>
        <p>
          Wikidata and the Wikimedia dumps are released under CC<S>0</S>. Babel Lag is not affiliated with or endorsed
          by the Wikimedia Foundation. The full method, with the SQL it refers to, is in the{" "}
          <a href={`${PIPE}/blob/main/docs/method.md`}>pipeline repository</a>.
        </p>
      </div>
    </Page>
  );
}
