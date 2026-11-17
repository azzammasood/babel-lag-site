import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/Page";
import { V } from "@/components/V";
import { report } from "@/lib/data";

export const metadata: Metadata = { title: "Weekly report" };
const F = "report.json";

export default function Report() {
  const doc = report();
  return (
    <Page
      eyebrow="Weekly report"
      title="This week, in words"
      lede="Written by an AI model from numbers already in the exports. Every number in it was checked against them before it was published."
    >
      <div className="prose">
        {doc ? (
          <>
            <p className="muted">
              AI-written by <V file={F} ptr="/rows/0/model" as="raw" /> from the
              exports of <V file={F} ptr="/rows/0/facts_date" as="day" />.
              Rankings in it come only from lists the pipeline computed. Lag is
              measured on Wikipedia only.
            </p>
            <blockquote>
              <V file={F} ptr="/rows/0/text" as="raw" />
            </blockquote>
            <p>
              How the text is checked is on the{" "}
              <Link href="/method/">method page</Link>.
            </p>
          </>
        ) : (
          <p>
            No report has been published yet. The method page explains how one
            is written and checked.
          </p>
        )}
      </div>
    </Page>
  );
}
