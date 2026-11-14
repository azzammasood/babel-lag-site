import type { Metadata } from "next";
import { Empty, Page } from "@/components/Page";

export const metadata: Metadata = { title: "Topics" };

export default function Topics() {
  return (
    <Page
      eyebrow="Topics"
      title="One topic, spreading"
      lede="For a single topic: the day its first article was written, and the day each other language caught up."
    >
      <Empty title="Nothing tracked yet.">
        Per-topic spread timelines are produced by the next pipeline milestone. This page stays empty until a topic
        has been measured; no sample topics are shown in the meantime.
      </Empty>
    </Page>
  );
}
