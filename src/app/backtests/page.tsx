import type { Metadata } from "next";
import { Empty, Page } from "@/components/Page";

export const metadata: Metadata = { title: "Backtests" };

export default function Backtests() {
  return (
    <Page
      eyebrow="Backtests"
      title="Does the method hold up on the past?"
      lede="Backtests replay past events through the method and compare what it says with what happened."
    >
      <Empty title="None yet.">
        Backtests are produced by the next pipeline milestone. Nothing is shown here until they have been run and
        published.
      </Empty>
    </Page>
  );
}
