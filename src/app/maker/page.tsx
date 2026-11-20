import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/Page";
import { S } from "@/components/V";

export const metadata: Metadata = { title: "The maker" };

// Written in the maker's first person from what the maker has stated (the pipeline README, its
// docs and the earlier projects). Anything not stated there is left as a visible placeholder for
// the maker to write; nothing is made up.
function Todo({ children }: { children: React.ReactNode }) {
  return (
    <span className="todo" role="note">
      <b>To be written by the maker:</b> {children}
    </span>
  );
}

export default function Maker() {
  return (
    <Page eyebrow="The maker" title="Why I built this">
      <div className="prose maker">
        <p className="lede">
          When the world learns something new, how long until it reaches each language on Wikipedia, and which
          languages stay in the dark? I built Babel Lag to measure that, for every language, from the public record.
        </p>
        <p>
          <Todo>a sentence or two about who you are and what you do.</Todo>
        </p>

        <h2>The third question in a series</h2>
        <p>
          Babel Lag is my third project. <a href="https://azzammasood.github.io/roshni-site/en/">Roshni</a> asked who
          sits in the dark for electricity. <a href="https://github.com/azzammasood/keystone-pipeline">Keystone</a>{" "}
          watched open-source supply chains: public GitHub activity linked to packages and known vulnerabilities.
          Babel Lag asks who sits in the dark for knowledge.
        </p>
        <p>
          <Todo>why this question matters to you.</Todo>
        </p>

        <h2>How I run it</h2>
        <ul>
          <li>
            It costs <S>$0</S>. Production runs on GitHub Actions; the heavier showcase runs on Databricks Free Edition
            and a local stack, and falls back to the free profile when it cannot run.
          </li>
          <li>It is non-commercial, and the code is MIT licensed.</li>
          <li>
            Every number on this site is read from a published export and checked against it before the site goes
            out. Methods and limits are public on <Link href="/method/">Method and data</Link>.
          </li>
          <li>
            Only aggregates are published. Editor names and IP addresses are dropped the moment they arrive; no
            editor is named, ranked or profiled.
          </li>
        </ul>

        <h2>Thanks</h2>
        <p>
          All of the data comes from the Wikimedia Foundation and the people who write and edit Wikipedia in every
          language. Thank you.
        </p>

        <h2>The code</h2>
        <ul>
          <li>
            <a href="https://github.com/azzammasood/babel-lag-pipeline">babel-lag-pipeline</a>: ingestion, parsing,
            quality, warehouse, lineage and the exports.
          </li>
          <li>
            <a href="https://github.com/azzammasood/babel-lag-site">babel-lag-site</a>: this site.
          </li>
        </ul>
        <p>
          If something here is wrong, <Link href="/corrections/">tell me</Link>.{" "}
          <Todo>how people can reach you (a profile link or an email address), if you want to add one.</Todo>
        </p>
      </div>
    </Page>
  );
}
