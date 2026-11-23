import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/Page";
import { S } from "@/components/V";

export const metadata: Metadata = { title: "The maker" };

// Written in the maker's first person, from what the maker has published: the pipeline README and
// docs, the earlier projects, and the maker's own site (azzammasood.github.io). Nothing else.
export default function Maker() {
  return (
    <Page eyebrow="The maker" title="Why I built this">
      <div className="prose maker">
        <p className="lede">
          When the world learns something new, how long until it reaches each language on Wikipedia, and which
          languages stay in the dark? I built Babel Lag to measure that, for every language, from the public record.
        </p>
        <p>
          I&apos;m Ahmad Uzzam Masood, a data engineer. I care about building systems that give people high-quality,
          consistent information they can rely on, from ingestion through modelling to observability. On weekends I
          build projects like this one, to sharpen how I design, ship and operate data systems.
        </p>

        <h2>The third question in a series</h2>
        <p>
          Babel Lag is my third project. <a href="https://azzammasood.github.io/roshni-site/en/">Roshni</a> asked who
          sits in the dark for electricity. <a href="https://github.com/azzammasood/keystone-pipeline">Keystone</a>{" "}
          watched open-source supply chains: public GitHub activity linked to packages and known vulnerabilities.
          Babel Lag asks who sits in the dark for knowledge.
        </p>
        <p>
          Wikipedia is the largest open record of what the world knows, written in hundreds of languages, and every
          article and every edit is public. That makes the gap between languages something that can be measured
          rather than guessed: when a topic first appears, when it reaches each language, and how many readers go
          looking for topics their language does not have yet.
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

        <h2>Find me</h2>
        <ul className="find-me">
          <li>
            <a href="https://azzammasood.github.io/">azzammasood.github.io</a>: my site, with my other projects and
            experience
          </li>
          <li>
            <a href="https://www.linkedin.com/in/azzammasood/">LinkedIn</a>
          </li>
          <li>
            <a href="https://github.com/azzammasood">GitHub</a>
          </li>
        </ul>
        <p>
          If something here is wrong, <Link href="/corrections/">tell me</Link>.
        </p>
      </div>
    </Page>
  );
}
