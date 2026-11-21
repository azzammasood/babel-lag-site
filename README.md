# babel-lag-site

The public site for **Babel Lag**: when the world learns something new, how long until it reaches
each language on Wikipedia, and which languages stay in the dark? The data pipeline lives in
[`babel-lag-pipeline`](https://github.com/azzammasood/babel-lag-pipeline).

A static Next.js site (React, TypeScript, Tailwind) that renders **only** the published exports of
the pipeline. Design: **Babel Tower** (concept 1 in `docs/design/options.md`), logo direction D.

**Status:** live at <https://azzammasood.github.io/babel-lag-site/>. `.github/workflows/deploy.yml`
rebuilds it from the pipeline release `site-data` every hour (and on demand); CI builds from the
committed snapshot of that release.

## Pages

| Page | Shows | State |
| --- | --- | --- |
| Now (`/`) | The tower (canvas): one floor per language, placed at its median lag, with a floor area that follows its coverage; live topic tracking | data |
| Languages, `/languages/<code>/` | The index (search, sort, bounded scroll) and one page per language, with its neighbours in the tower | data |
| Pipeline Live | Totals, rate, latency, cost, services, last run, run history, hourly stream | data |
| Lineage | An interactive graph of `metadata_lineage.json` (pan, zoom, upstream and downstream highlight, details), with tables as a fallback | data |
| Catalog | Every dataset, with search and layer filters | data |
| How it's built | An architecture diagram of the tools that really ran (Simple Icons logos, bundled) | text |
| Weekly report | The AI-written report, labelled, numbers traced to `report.json` | data |
| Method and data, The maker, Corrections | Method, glossary; the maker's page in the first person, with marked placeholders | text and data |
| Backtests, Topics, `/topics/<item>/` | The backtest topics and each one's spread by language, from `backtests.json` | data once published (empty state until then) |

## Rules the site keeps

- **Every number comes from an export.** A figure is written as `<V file ptr as>`: it is read from
  that JSON Pointer at build time and carries its source. `tests/e2e/trace.spec.ts` re-reads every
  figure on every page from the export and fails on any digit that is not traced (or explicitly
  marked as not data with `<S>`).
- **Nothing is filled in.** A file that fails its schema is left out and the page says the data is
  unavailable. A missing value shows as "not measured".
- **Motion follows the data.** The tower builds at one second per year of median lag; Pipeline Live
  replays the measured hours. Both draw on a canvas, pause off screen and in hidden tabs, and cap the
  pixel ratio at 2. Page changes and the colour mode switch animate with the View Transitions API
  (a CSS fade without it). Reduced motion turns all of it off. Nothing follows the cursor or the
  scroll position.
- **Three themes:** Babel (dark orange, the default), Dark and Light, chosen with the header button
  and remembered; every token pair meets WCAG AA.
- **Accessibility:** axe (WCAG 2.2 AA) on the main pages in all three themes; the tower has a text
  description and the same values as a list.

## Commands

```
npm ci
npm run data            # fixtures/site-data -> data/site (schema-checked)
node scripts/fetch-data.mjs --release                              # from the pipeline release instead
node scripts/fetch-data.mjs --release --strict --save fixtures/site-data   # refresh the snapshot
npm run build           # static export to out/
npm run serve           # serve out/ at http://127.0.0.1:4173
npm run lint ; npm run typecheck ; npm test
npm run test:e2e        # trace + accessibility on the built site (needs: npx playwright install chromium)
```

`fixtures/site-data/` is a committed snapshot of the release (generated 2026-11-15). CI builds from
it so a pull request never depends on the network; the deploy workflow builds from the release.

## Layout

```
src/app/         pages (App Router, static export)
src/components/  V (traced figure), Tower and HourColumns (3D, client), Nav, Page
src/lib/         data loader, formats, JSON Pointer, language names
scripts/         fetch-data (schema check + derived sums), serve
schemas/         JSON Schemas copied from the pipeline contracts/
fixtures/        snapshot of real exports used by CI
tests/           unit (schemas, sums, formats) and e2e (trace, axe)
docs/design/     the design gate: options, preview, logos, screens
docs/screens/    screenshots of the built site
```

## Gaps (logged, not hidden)

- `update_lag.json` and `spreading.json` were not in the release when the snapshot was taken, so
  CI builds show their "not published" states. Both were verified against real local exports.
- The weekly written report is not delivered by the pipeline.
- The metadata exports (catalog, glossary, lineage) have no published JSON Schema; they are only
  checked to be valid JSON.
- Language names come from the runtime (Unicode CLDR through `Intl`); a few Wikipedia-only codes
  are named by hand in `src/lib/names.ts`, and codes the runtime does not know show as the code.
  Native-script names use system fonts.
- dbt docs and benchmarks are not linked until the pipeline publishes them.

Data: Wikimedia Foundation (EventStreams, MediaWiki history dumps, pageview dumps, Wikidata),
CC0. Independent and non-commercial; not affiliated with the Wikimedia Foundation.
Code: MIT (see `LICENSE`).
