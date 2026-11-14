# Babel Lag site: design options (design gate, milestone 4)

Roshni measured who sits in the dark for electricity. Babel Lag measures who sits in the dark for
**knowledge**: how long a new topic takes to reach each language on Wikipedia.

Round 6: **three** concepts. Each has one animated 3D element, and each of those is the data
itself rather than decoration: a tower that builds in the order knowledge arrives, a wave that
reaches each language at its measured lag, and red links that turn over to blue.

- Preview: [`preview.html`](preview.html) (double-click; inline CSS/JS and data; no libraries;
  fonts load from Google Fonts when online and fall back to system fonts). Switch concept, page
  (Home / Pipeline Live), theme and logo in the top bar.
- Screens in [`screens/`](screens/): `<concept>-<page>-<theme>-live.png` (animation running),
  `<concept>-<page>-<theme>.png` (full page, still), `<concept>-home-phone.png` (375 px).
- Data: copies of the backend exports in [`sample-data/`](sample-data/) (generated
  2026-11-12 15:41 UTC, profile `free`, 20-language slice, 523 wikis live). `tools/build.py`
  inlines them; derived values are plain sums of `live.json` rows by hour and by wiki.
- Not in the slice yet: **topics** and **backtests** (milestone 3). Every concept shows a labelled
  empty state for them, never sample numbers.

## Rules shared by all three

- **Every animation is a clock over measured values.** On Home, one second is one year of median
  lag: nothing appears before its measured time. On Pipeline Live, the animation replays the
  measured hours of `live.json` (labelled as a replay). Each has Replay and Pause.
- **Nothing follows the cursor and nothing is driven by scrolling.** The only ambient motion is
  the tower's slow turn, which is there so every face can be read; Pause stops it.
- **Reduced motion** shows the finished state as one still frame; the same data is always
  available as a table.
- **"First article"** means the earliest article among the followed languages (the reference
  set); the footer says so.
- **Colour-blind safe.** Data is carried by position, size, order, solid versus dashed and printed
  values, never by hue alone.
- **Keyboard and screen readers.** Each 3D scene has a text description (`role="img"` +
  `aria-label`) and a plain list or table of the same values; controls are real buttons with a
  visible 3 px focus ring; native-script names carry `lang` (and `dir="rtl"` for Urdu).
- **Contrast.** Text, muted text, accent and data colours meet WCAG AA (≥ 4.5:1) on both the page
  background and the card surface, in light and dark; `tools/build.py` asserts this and writes the
  tables below. `dim` is decorative and never carries text.
- **Footer attribution** on every page: Wikimedia Foundation sources with links, CC0 for Wikidata
  and the dumps, "independent, non-commercial, not affiliated with Wikimedia", Wikipedia-only
  limits, aggregates-only privacy note, Method and Corrections links.
- **Honest engines.** Tools show "ran in last run" or "not in last run" from
  `pipeline_metrics.engines[].active`.

---

## 1. Babel Tower

- **Idea:** the project's namesake, built at the speed knowledge actually travels. A topic's first
  article is year 0. Each language adds its floor when the median topic reaches it (Yoruba at 2.8
  years, Zulu at 10.7), and the floor is only as wide as that language's coverage, so the tower
  comes out uneven and unfinished-looking. Each floor carries the language's name in its own
  script.
- **Mood:** warm sandstone at dusk; architectural, a little mythic.
- **Typography:** Fraunces for headlines; Work Sans for body; Noto per script on the floors.
- **Layout:** headline and year clock, then the 3D tower beside a floor-by-floor log that fills in
  step with it.
- **Languages lighting up:** floors dropping into place in order of lag.
- **Pipeline Live hero:** the tower's brickwork: one 3D column per measured hour, as tall as that
  hour's events, laid in order while the matching row of the hour table is highlighted.
- **3D and motion:** CSS 3D boxes; build runs at 1 second = 1 year; slow turn.
- **Palette:**
<!-- palette:tower -->
| role | light hex | on bg | dark hex | on bg |
| --- | --- | --- | --- | --- |
| bg | `#F4E9D8` | background | `#120C1F` | background |
| surface | `#FFF8EE` | 1.14:1 | `#1D1530` | 1.09:1 |
| text | `#2B1B10` | 13.81:1 | `#F6E9D6` | 15.98:1 |
| muted | `#6B5440` | 5.90:1 | `#BCA98F` | 8.39:1 |
| accent | `#A8341A` | 5.52:1 | `#FF8A5B` | 8.23:1 |
| data | `#1F5F8B` | 5.70:1 | `#6EB6FF` | 8.92:1 |
| dim | `#E0CDB2` | decorative only (empty/off states, never text) | `#33284A` | decorative only (empty/off states, never text) |
<!-- /palette -->

## 2. Ripple

- **Idea:** something is learned, then it spreads. The first article sits at the centre of a 3D
  field. A ring leaves it at one year per second. Each language stands at its median lag and
  lights up only when the ring arrives; its column rises to the share of topics it covers.
- **Mood:** deep water at night (dark) or a pale chart (light); calm, precise, a little awe.
- **Typography:** Space Grotesk for headlines; Inter for body; Noto per script for the names.
- **Layout:** headline and year clock, then the field as a full-width stage.
- **Languages lighting up:** names and columns igniting as the ring passes.
- **Pipeline Live hero:** all 523 wikis as points, busiest at the centre; each hour a wiki's column
  rises to its measured events and falls when it goes quiet.
- **3D and motion:** canvas with a fixed camera; the ring and columns move, the view does not.
- **Palette:**
<!-- palette:ripple -->
| role | light hex | on bg | dark hex | on bg |
| --- | --- | --- | --- | --- |
| bg | `#EEF5F9` | background | `#04101A` | background |
| surface | `#FFFFFF` | 1.10:1 | `#0A1B2A` | 1.10:1 |
| text | `#0A2233` | 14.78:1 | `#E6F4FF` | 17.13:1 |
| muted | `#486578` | 5.59:1 | `#93B0C6` | 8.47:1 |
| accent | `#8A5A00` | 5.38:1 | `#FFD166` | 13.31:1 |
| data | `#0B6A94` | 5.44:1 | `#4CC9F0` | 9.98:1 |
| dim | `#C7DAE6` | decorative only (empty/off states, never text) | `#163047` | decorative only (empty/off states, never text) |
<!-- /palette -->

## 3. Red Link

- **Idea:** Wikipedia's own grammar. A blue link has an article; a red link is one nobody has
  written yet. Every language starts as 100 red links and the ones it has written turn over, in
  3D, to blue. Headline: "In Zulu Wikipedia, 99 of every 100 shared topics are still a red link."
- **Mood:** an encyclopedia article; familiar, quietly damning.
- **Typography:** Source Serif 4 for headlines; Inter for body; Noto per script.
- **Layout:** headline beside a tilted article card that turns to the next language every five
  seconds; below it, all 20 languages as paragraphs of links.
- **Languages lighting up:** red links flipping to blue, up to each language's coverage.
- **Pipeline Live hero:** "Recent changes, counted": a rolling counter turns to the events
  measured in each hour while that row of the hour table is highlighted.
- **3D and motion:** CSS 3D card turn and link flips (once, on load); rolling digits.
- **Palette:** (accent = blue link, data = red link; red links are also dashed)
<!-- palette:redlink -->
| role | light hex | on bg | dark hex | on bg |
| --- | --- | --- | --- | --- |
| bg | `#F8F9FA` | background | `#101418` | background |
| surface | `#FFFFFF` | 1.05:1 | `#171C22` | 1.08:1 |
| text | `#202122` | 15.30:1 | `#EAECF0` | 15.64:1 |
| muted | `#54595D` | 6.72:1 | `#A2A9B1` | 7.79:1 |
| accent | `#2A4B8D` | 8.00:1 | `#88AEFF` | 8.41:1 |
| data | `#B32424` | 6.24:1 | `#FF8A80` | 8.10:1 |
| dim | `#DADDE3` | decorative only (empty/off states, never text) | `#2A3038` | decorative only (empty/off states, never text) |
<!-- /palette -->

---

## Logo directions (`logos/`)

Each SVG switches ink via `prefers-color-scheme`, and in the site takes the concept's tokens.
[`logos/check.html`](logos/check.html) renders them at 16, 32, 64 and 128 px;
[`screens/logos-light.png`](screens/logos-light.png) and
[`screens/logos-dark.png`](screens/logos-dark.png) show the result.

| | Direction | Idea | Favicon check |
| --- | --- | --- | --- |
| A | `a-halflit.svg` | A heavy **B** lit only on its left third. Works with any concept. | Reads at 16 px in both themes. |
| B | `b-redlink.svg` | A **B** underlined like a link: solid, then dashed where it is missing. Pairs with Red Link. | The B reads at 16 px; the dashes merge into a line. |
| C | `c-ripple.svg` | A lit source with two rings spreading from it. Pairs with Ripple. | Reads at 16 px. |
| D | `d-tower.svg` | Four uneven floors, the top one lit. Pairs with Babel Tower. | Reads as a stepped stack at 16 px. |

## Owner's choice

Pick one concept (1 to 3) and one logo (A to D). The build then uses only that design.
