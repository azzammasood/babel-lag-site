import type { Metadata } from "next";
import { Page } from "@/components/Page";

export const metadata: Metadata = { title: "The maker" };

export default function Maker() {
  return (
    <Page eyebrow="The maker" title="Who built this">
      <div className="prose">
        <p>
          Babel Lag is a non-commercial project built and maintained by{" "}
          <a href="https://github.com/azzammasood">azzammasood</a>. It follows two earlier projects: Roshni, about
          who sits in the dark for electricity, and Keystone, about open-source supply chains. The pipeline and this
          site are open source:
        </p>
        <ul>
          <li>
            <a href="https://github.com/azzammasood/babel-lag-pipeline">babel-lag-pipeline</a>: ingestion, parsing,
            quality, warehouse, lineage and the exports.
          </li>
          <li>
            <a href="https://github.com/azzammasood/babel-lag-site">babel-lag-site</a>: this site.
          </li>
        </ul>
      </div>
    </Page>
  );
}
