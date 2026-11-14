import Link from "next/link";
import { Page } from "@/components/Page";

export default function NotFound() {
  return (
    <Page eyebrow="Not found" title="This floor has not been built.">
      <p>
        <Link href="/">Back to the tower</Link>
      </p>
    </Page>
  );
}
