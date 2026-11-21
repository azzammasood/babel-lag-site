import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { RouteTransitions } from "@/components/RouteTransitions";
import { languages } from "@/lib/data";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "800"], variable: "--font-fraunces" });
const work = Work_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-work" });

export const metadata: Metadata = {
  title: { default: "Babel Lag", template: "%s · Babel Lag" },
  description:
    "When the world learns something new, how long until it reaches each language on Wikipedia, and which languages stay in the dark?",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Applied before paint: the saved theme (Babel by default), and `vt` when the View Transitions API exists
// (the CSS fallback entry animation is used only without it), and `intro` on a first visit to the
// home page, which covers the page until the landing intro (components/Intro) takes over.
const boot = `(function(d){var m="babel";try{var s=localStorage.getItem("babel-mode");if(s==="dark"||s==="light"||s==="babel")m=s}catch(e){}d.dataset.mode=m;if(document.startViewTransition)d.classList.add("vt");try{var b=${JSON.stringify(process.env.NEXT_PUBLIC_BASE_PATH ?? "")},p=location.pathname;if((p===b+"/"||p===b||p===b+"/index.html")&&!sessionStorage.getItem("babel-intro-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("intro")}catch(e){}})(document.documentElement)`;

const FALLBACK_SOURCES = [
  { name: "Wikimedia EventStreams", url: "https://stream.wikimedia.org/v2/stream/" },
  { name: "Wikimedia dumps", url: "https://dumps.wikimedia.org/" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const env = languages();
  const sources = env?.sources ?? FALLBACK_SOURCES;
  return (
    <html lang="en" className={`${fraunces.variable} ${work.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <RouteTransitions />
        <main id="main">{children}</main>
        <footer className="site">
          <div className="wrap">
            <nav aria-label="More pages">
              <Link href="/maker/">The maker</Link>
              <Link href="/corrections/">Corrections</Link>
              <Link href="/method/">Method and limits</Link>
            </nav>
            <p>
              <b>Data:</b> Wikimedia Foundation:{" "}
              {sources.map((s, i) => (
                <span key={s.url}>
                  {i ? " · " : ""}
                  <a href={s.url}>{s.name}</a>
                </span>
              ))}
              {" · "}
              <a href="https://stream.wikimedia.org/v2/stream/">Wikimedia EventStreams</a>. Wikidata and the Wikimedia
              dumps are CC0. Babel Lag is independent and non-commercial, and is not affiliated with or endorsed by
              the Wikimedia Foundation.
            </p>
            <p>
              Lag is measured on Wikipedia only; it says nothing about other media in a language. Aggregates only: no
              editor is named, ranked or profiled. Code MIT.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
