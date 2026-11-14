import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { languages } from "@/lib/data";

export const metadata: Metadata = { title: "Corrections" };

export default function Corrections() {
  const url = languages()?.corrections ?? "https://github.com/azzammasood/babel-lag-pipeline/issues";
  return (
    <Page
      eyebrow="Corrections"
      title="Found something wrong?"
      lede="Every number here comes from a published export and a public method. If one looks wrong, say so and it will be checked."
    >
      <div className="prose">
        <ul>
          <li>
            Open an issue on the <a href={url}>pipeline repository</a> with the page, the figure and why it looks
            wrong.
          </li>
          <li>Confirmed errors are fixed in the pipeline, the exports are published again, and the fix is noted in the issue.</li>
          <li>
            The site only shows aggregates by language, topic, wiki and time. If you believe something here identifies
            a person, report it the same way and it will be treated as urgent.
          </li>
        </ul>
      </div>
    </Page>
  );
}
