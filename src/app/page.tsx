import Link from "next/link";
import { Native } from "@/components/Native";
import { Empty, Unavailable } from "@/components/Page";
import { type Floor, Tower } from "@/components/Tower";
import { S, V } from "@/components/V";
import { byLag, languages } from "@/lib/data";
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
  const floors: Floor[] = rows.map((r) => ({
    lagY: r.median_lag_days / 365.25,
    size: Math.round(74 + (290 * r.coverage_pct) / maxCov),
    front: <Native code={r.language} />,
    side: (
      <>
        {english(r.language)}&nbsp;
        <V file={F} ptr={`/rows/${r.i}/coverage_pct`} as="raw" />%
      </>
    ),
    log: (
      <>
        <span className="t">
          +<V file={F} ptr={`/rows/${r.i}/median_lag_days`} as="years" /> yrs
        </span>
        <Link href={`/languages/${r.language}/`}>
          <Native code={r.language} /> {native(r.language) === english(r.language) ? "" : english(r.language)}
        </Link>
        <span>
          <V file={F} ptr={`/rows/${r.i}/coverage_pct`} as="raw" />%
        </span>
      </>
    ),
  }));

  return (
    <div className="wrap page">
      <p className="eyebrow">Now</p>
      <h1>
        The tower of Babel, built at the speed knowledge <em>actually</em> travels.
      </h1>
      <p className="lede">
        A new topic gets its first Wikipedia article at year <S>0</S>. Each language adds its floor when the median
        topic reaches it, and the floor is only as wide as the share of topics that language covers. The last floor,{" "}
        {english(slow.language)}, arrives after <V file={F} ptr={`/rows/${slow.i}/median_lag_days`} as="years" />{" "}
        years.
      </p>
      <p className="small muted">
        Profile <b>{env.produced_by.profile}</b> · generated <V file={F} ptr="/generated_at" as="date" /> UTC ·{" "}
        <V file={F} ptr="/row_count" as="raw" /> languages in this slice
      </p>

      <Tower
        floors={floors}
        yrMax={yrMax}
        label={`A tower of ${rows.length} floors, one per language, placed in order of median lag from ${english(fast.language)} at the base to ${english(slow.language)} at the top; each floor is as wide as that language's coverage. The same values are in the list beside it.`}
      />
      <p className="key">
        Floor order and timing = median coverage lag. Floor width = coverage of the shared reference topics. The tower
        turns slowly so every face can be read; Pause stops it. In this slice the first article is the earliest among
        the followed languages.
      </p>

      <h2>Topics spreading now</h2>
      <Empty title="Nothing tracked yet.">
        Live topic tracking (a topic&apos;s first article, then each language catching up) arrives with the next
        pipeline milestone. Until a topic is measured, this stays empty.
      </Empty>

      <h2>Where to go next</h2>
      <div className="grid2">
        <Link className="card" href="/languages/">
          <b>Languages</b>
          <br />
          Every language, with its lag and coverage.
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
