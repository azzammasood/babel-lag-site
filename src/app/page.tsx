import Link from "next/link";
import { Names } from "@/components/Native";
import { Unavailable } from "@/components/Page";
import { Spreading } from "@/components/Spreading";
import { Intro } from "@/components/Intro";
import { type Floor, Tower } from "@/components/Tower";
import { S, V } from "@/components/V";
import { backtests, byLag, languages } from "@/lib/data";
import { english, native } from "@/lib/names";

const F = "languages.json";

export default function Now() {
  const env = languages();
  if (!env || env.rows.length === 0) {
    return (
      <div className="wrap page">
        <h1>Babel Lag</h1>
        <Unavailable file={F} />
      </div>
    );
  }
  const rows = byLag(env.rows);
  const maxCov = Math.max(...rows.map((r) => r.coverage_pct));
  const slow = rows[rows.length - 1]!;
  const fast = rows[0]!;
  const yrMax = Math.ceil(slow.median_lag_days / 365.25);
  const floors: Floor[] = rows.map((r, idx) => ({
    info: (
      <>
        <b className="pop-lang">
          <Names code={r.language} />
        </b>
        <span>
          Floor <S>{idx + 1}</S> of <V file={F} ptr="/row_count" as="raw" />. A new topic reaches it after{" "}
          <b>
            <V file={F} ptr={`/rows/${r.i}/median_lag_days`} as="years" /> years
          </b>{" "}
          (median), and it has an article for{" "}
          <b>
            <V file={F} ptr={`/rows/${r.i}/coverage_pct`} as="raw" />%
          </b>{" "}
          of the shared topics.
        </span>
      </>
    ),
    lagY: r.median_lag_days / 365.25,
    size: Math.round(24 + 346 * Math.sqrt(r.coverage_pct / maxCov)),
    log: (
      <>
        <span className="t">
          +<V file={F} ptr={`/rows/${r.i}/median_lag_days`} as="years" /> yrs
        </span>
        <Link href={`/languages/${r.language}/`}>
          <Names code={r.language} />
        </Link>
        <span>
          <V file={F} ptr={`/rows/${r.i}/coverage_pct`} as="raw" />%
        </span>
      </>
    ),
  }));
  const hasBacktests = (backtests()?.rows.length ?? 0) > 0;
  // The intro stacks a sample of the languages, evenly spread along the lag order.
  const SAMPLE = Math.min(16, rows.length);
  const blocks = Array.from({ length: SAMPLE }, (_, j) => {
    const r = rows[Math.round((j * (rows.length - 1)) / Math.max(1, SAMPLE - 1))]!;
    return { name: native(r.language), size: Math.round(40 + 300 * Math.sqrt(r.coverage_pct / maxCov)) };
  });

  return (
    <div className="wrap page">
      <Intro
        blocks={blocks}
        steps={[
          <p key="a">
            Something new happens in the world. Someone writes it down on Wikipedia, in <em>one</em> language first.
          </p>,
          <p key="b">
            Then it travels, one language at a time. Each block is a language, in its own script, landing when a new
            topic usually reaches it.
          </p>,
          <div key="c">
            <p>
              <V file={F} ptr="/row_count" as="raw" /> languages. The last one waits{" "}
              <em>
                <V file={F} ptr={`/rows/${slow.i}/median_lag_days`} as="years" /> years
              </em>
              .
            </p>
            <small>Babel Lag measures who is still in the dark, from Wikimedia&apos;s public data.</small>
          </div>,
        ]}
      />
      <Tower
        intro={
          <>
            <p className="eyebrow">Now</p>
            <h1>
              The tower of Babel, built at the speed knowledge <em>actually</em> travels.
            </h1>
            <p className="lede">
              A new topic gets its first Wikipedia article at year <S>0</S>. Each language adds its floor when the median
              topic reaches it, and the area of the floor is the share of topics that language covers. The first floor
              is {english(fast.language)}, after <V file={F} ptr={`/rows/${fast.i}/median_lag_days`} as="years" /> years;
              the last is {english(slow.language)}, after <V file={F} ptr={`/rows/${slow.i}/median_lag_days`} as="years" />{" "}
              years.
            </p>
            <p className="small muted">
              Profile{" "}
              <b>
                <V file={F} ptr="/produced_by/profile" as="raw" />
              </b> · generated <V file={F} ptr="/generated_at" as="date" /> UTC ·{" "}
              <V file={F} ptr="/row_count" as="raw" /> languages
            </p>
          </>
        }
        explain={
          <>
            <p>
              Each floor is one of the <V file={F} ptr="/row_count" as="raw" /> Wikipedia languages. When the world
              learns something new, it gets its first Wikipedia article somewhere; a language adds its floor when the
              median new topic finally reaches it. So the tower rises in the order knowledge arrives.
            </p>
            <p>
              The bigger the floor, the more of the shared topics that language has an article for. The clock runs
              one second for every year of waiting.
            </p>
          </>
        }
        floors={floors}
        yrMax={yrMax}
        label={`A tower of ${rows.length} floors, one per language, placed in order of median lag from ${english(fast.language)} at the base to ${english(slow.language)} at the top; the area of each floor is that language's coverage. Every value is in the table on the Languages page.`}
      >
        <p style={{ marginTop: 12 }}>
          <Link href="/languages/">
            All <V file={F} ptr="/row_count" as="raw" /> languages
          </Link>
        </p>
      </Tower>
      <p className="key">
        Floor order and timing = median coverage lag. Floor area = coverage of the reference topics. The camera follows
        the newest floor, then pulls back once to show the whole tower. Point at the tower for an explanation.
      </p>

      <h2>Topics spreading now</h2>
      <Spreading />
      {hasBacktests ? (
        <p style={{ marginTop: 10 }}>
          Past topics, with the wait of every language: <Link href="/topics/">how individual topics spread</Link>.
        </p>
      ) : null}

      <h2>Where to go next</h2>
      <div className="grid2">
        <Link className="card" href="/languages/">
          <b>Languages</b>
          <br />
          Every language, with its lag, coverage, depth and unmet demand.
        </Link>
        <Link className="card" href="/pipeline/">
          <b>Pipeline Live</b>
          <br />
          What the pipeline measured, and what it cost.
        </Link>
        <Link className="card" href="/method/">
          <b>Method and data</b>
          <br />
          How lag is measured, and its limits.
        </Link>
      </div>
    </div>
  );
}
