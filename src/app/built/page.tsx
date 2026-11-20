import type { Metadata } from "next";
import Link from "next/link";
import { Architecture } from "@/components/Architecture";
import { Page } from "@/components/Page";
import { V } from "@/components/V";
import { metrics } from "@/lib/data";

export const metadata: Metadata = { title: "How it's built" };
const M = "pipeline_metrics.json";
const PIPE = "https://github.com/azzammasood/babel-lag-pipeline";
const SITE = "https://github.com/azzammasood/babel-lag-site";

export default function Built() {
  const m = metrics();
  return (
    <Page
      eyebrow="How it's built"
      title="One method, two ways to run it"
      lede="The same SQL runs on a free profile that keeps this site updating at no cost, and on a full profile that puts the heavier tools to real work. When the full profile fails, the free one publishes instead, and the site says so."
    >
      <Architecture />

      {m ? (
        <p className="key">
          The data on this site right now was produced by the{" "}
          <b>
            <V file={M} ptr="/profile/produced_by" as="raw" />
          </b>{" "}
          profile{m.profile.fallback ? " as a fallback" : ""}. <Link href="/pipeline/">Pipeline Live</Link> shows which
          services ran in that run, with their versions.
        </p>
      ) : null}

      <div className="prose">
        <h2>Code and decisions</h2>
        <ul>
          <li>
            <a href={PIPE}>Pipeline repository</a>: collector, parsers, SQL, data models, contracts and exports.
          </li>
          <li>
            <a href={`${PIPE}/blob/main/docs/DECISIONS.md`}>Decisions</a>,{" "}
            <a href={`${PIPE}/blob/main/docs/method.md`}>method</a>,{" "}
            <a href={`${PIPE}/blob/main/docs/benchmarks.md`}>benchmarks</a> and the{" "}
            <a href={`${PIPE}/blob/main/docs/claims-audit.md`}>claims audit</a> behind every tool on this page.
          </li>
          <li>
            <a href={SITE}>Site repository</a>: every figure on this site is checked against the exports before a
            build is published.
          </li>
        </ul>
      </div>
    </Page>
  );
}
