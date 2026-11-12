# Babel Lag site: design options (design gate, milestone 4)

Roshni measured who sits in the dark for electricity. Babel Lag measures who sits in the dark for
**knowledge**: how long a new topic takes to reach each language on Wikipedia. Each concept below
turns that question into one strong visual metaphor. Every metaphor is driven by a measured field;
none decorates with numbers that were not measured.

- Preview: [`preview.html`](preview.html) (double-click; inline CSS/JS and data; fonts load from
  Google Fonts when online and fall back to system fonts). Switch concept, page (Home / Pipeline
  Live), theme and logo in the top bar. Screens: [`screens/`](screens/).
- Data: copies of the backend exports in [`sample-data/`](sample-data/) (generated
  2026-11-12 15:41 UTC, profile `free`, 20-language slice, 523 wikis live). `tools/build.py`
  inlines them; derived values are plain sums of `live.json` rows by hour and by wiki.
- Not in the slice yet: **topics** and **backtests** (milestone 3). Every concept shows a labelled
  empty state for them, never sample numbers.

## Rules shared by all six

- **Motion tied to data only.** Pipeline Live replays the measured hourly buckets of `live.json`
  (labelled "replay of N measured hours, not a live feed"); in production it steps only when a new
  export arrives. Nothing pulses, flickers or counts up without a measured value behind it.
  `prefers-reduced-motion` stops all animation and shows the last measured hour; every replay has a
  Pause button.
- **Colour-blind safe.** Each concept encodes data with one hue plus lightness, or with size and
  position; no red/green pairs. Every value is also printed as text next to its mark.
- **Keyboard and screen readers.** Native links and buttons, visible 3 px focus ring, charts carry
  `role="img"` with an `aria-label` summary; per-item marks are focusable or listed with labels;
  native-script names carry `lang` (and `dir="rtl"` for Urdu).
- **Contrast.** Text, muted text, accent and data colours meet WCAG AA (≥ 4.5:1) on both the page
  background and the card surface, in light and dark; `tools/build.py` asserts this and writes the
  tables below. `dim` is decorative (unlit/empty state) and never carries text.
- **Footer attribution** on every page: Wikimedia Foundation sources with links, CC0 for Wikidata
  and the dumps, "independent, non-commercial, not affiliated with Wikimedia", Wikipedia-only
  limits, aggregates-only privacy note, Method and Corrections links.
- **Honest engines.** Tools appear with "ran in last run" or "not in last run" straight from
  `pipeline_metrics.engines[].active`.

---

## 1. Blackout

- **Idea:** the most direct echo of Roshni. Each language's own name, set huge in its own script,
  is lit from the reading edge exactly as far as its `coverage_pct`. Urdu (24.72%) is a quarter
  lit; Zulu (0.75%) is a sliver. The wall is mostly dark, and that is the finding.
- **Mood:** night city, sodium lamps, protest typography. Stark, quiet, unforgettable.
- **Typography:** Big Shoulders Display (condensed, heavy) for headlines; Inter for body; Noto Sans
  family per script (Devanagari, Bengali, Ethiopic, Gurmukhi, Tamil, Telugu, Naskh Arabic) for the
  native names.
- **Layout:** full-bleed stacked "word wall", one language per row, value printed at the right
  edge; Topics/Backtests empty states below.
- **Languages lighting up:** the word wall itself (gradient clipped to the glyphs).
- **Pipeline Live hero:** "The switchboard": one bulb per wiki heard (523), lit in an hour only if
  that wiki produced measured events, brightness by log event count; two giant readouts
  (events/s, event-to-table latency).
- **Motion:** the switchboard steps through measured hours; the wall is static.
- **Accessibility:** names carry an English `aria-label`; lit share is printed as text.
- **Palette:**
<!-- palette:blackout -->
| role | light hex | on bg | dark hex | on bg |
| --- | --- | --- | --- | --- |
| bg | `#ECE9E2` | background | `#050505` | background |
| surface | `#F7F5F0` | 1.11:1 | `#111111` | 1.08:1 |
| text | `#111111` | 15.57:1 | `#F5F1E8` | 18.08:1 |
| muted | `#57534B` | 6.31:1 | `#A39E93` | 7.64:1 |
| accent | `#7A4E00` | 5.94:1 | `#FFD23F` | 14.11:1 |
| data | `#7A4E00` | 5.94:1 | `#FFD23F` | 14.11:1 |
| dim | `#D3CEC4` | decorative only (empty/off states, never text) | `#2E2E2E` | decorative only (empty/off states, never text) |
<!-- /palette -->

## 2. Departures

- **Idea:** lag is a delay. A split-flap station board: knowledge departs from the first Wikipedia;
  each language is a destination with its **median delay** and the share of topics that have
  **arrived**. Topics show "NO SERVICE" until milestone 3 measures them.
- **Mood:** European station at night; mechanical, tactile, instantly legible.
- **Typography:** Space Mono for flaps and headings; Inter for body; Noto per script for native
  names (one flap per name so complex scripts are never split).
- **Layout:** one board as the hero, longest delays first; the board stays black in both themes
  (as real boards do); the page around it switches.
- **Languages lighting up:** the board (yellow delay column).
- **Pipeline Live hero:** "Platform board": each stage is a service with version and RAN / NOT RUN
  status from the last run; flap clocks for events/s, latency, events in the replayed hour, cost.
- **Motion:** flaps flip only when a value is loaded or changes (staggered 18 ms per character).
- **Accessibility:** each row has a full-sentence `aria-label`; flaps are `aria-hidden`.
- **Palette:** (board: `#0A0A0B` with `#F4F4F4` flap text at 17.99:1 and `#FFC400` highlights at 12.39:1)
<!-- palette:departures -->
| role | light hex | on bg | dark hex | on bg |
| --- | --- | --- | --- | --- |
| bg | `#F1F1EE` | background | `#0E0E10` | background |
| surface | `#FFFFFF` | 1.13:1 | `#1C1C20` | 1.14:1 |
| text | `#111114` | 16.66:1 | `#F2F2F2` | 17.23:1 |
| muted | `#55555C` | 6.53:1 | `#A0A0A8` | 7.43:1 |
| accent | `#0B3D91` | 8.88:1 | `#FFC400` | 12.07:1 |
| data | `#0B3D91` | 8.88:1 | `#FFC400` | 12.07:1 |
| dim | `#D6D6D2` | decorative only (empty/off states, never text) | `#2E2E34` | decorative only (empty/off states, never text) |
<!-- /palette -->

## 3. Seismograph

- **Idea:** new knowledge is a tremor. Each language is a needle trace on graph paper that stays
  flat until its median coverage lag, then spikes (height = coverage). Twenty traces, twenty late
  arrivals.
- **Mood:** scientific instrument; red ink on graph paper (light), green phosphor oscilloscope
  (dark).
- **Typography:** IBM Plex Serif italic for headlines; IBM Plex Mono for body and readouts.
- **Layout:** one wide graph-paper panel, years on the x axis; a caption states that the wiggle
  shape is a marker, not data.
- **Languages lighting up:** the traces, ordered fastest to slowest.
- **Pipeline Live hero:** "The drum": a seismogram of events per measured hour across all wikis,
  a needle stepping through the replay, a giant magnitude readout for the current hour.
- **Motion:** traces draw in once on load (reveals measured positions); the drum needle steps per
  measured hour.
- **Accessibility:** each trace has a `<title>` with language, years and coverage.
- **Palette:**
<!-- palette:seismograph -->
| role | light hex | on bg | dark hex | on bg |
| --- | --- | --- | --- | --- |
| bg | `#F3EFE6` | background | `#031A12` | background |
| surface | `#FBF8F2` | 1.08:1 | `#072619` | 1.12:1 |
| text | `#1A1A1A` | 15.17:1 | `#D7FFE9` | 16.69:1 |
| muted | `#5C574E` | 6.25:1 | `#8FC2A8` | 9.01:1 |
| accent | `#B0101C` | 6.23:1 | `#39FF88` | 13.65:1 |
| data | `#B0101C` | 6.23:1 | `#39FF88` | 13.65:1 |
| dim | `#D9D2C3` | decorative only (empty/off states, never text) | `#124A32` | decorative only (empty/off states, never text) |
<!-- /palette -->

## 4. Light-years

- **Idea:** knowledge travels like starlight. The first article is a sun on the left; each language
  is a planet at its median lag in years, shown as a **moon phase**: the lit crescent is its
  coverage share of a full disc. Most planets are almost new moons.
- **Mood:** observatory, deep space (dark) or star-chart paper (light); calm and awe-struck.
- **Typography:** Unbounded (wide geometric) for headlines; Inter for body.
- **Layout:** big headline naming the slowest language and its years; a wide space panel; readouts
  below.
- **Languages lighting up:** the moon-phase planets.
- **Pipeline Live hero:** "Listening to 523 wikis": a radio-telescope waterfall (columns = 48
  busiest wikis, rows = measured hours, brightness = log events) with a scan line replaying hours.
- **Motion:** only the scan line moves, one measured hour per step.
- **Accessibility:** planets are focusable with labels; phase is also printed in the caption.
- **Palette:**
<!-- palette:lightyears -->
| role | light hex | on bg | dark hex | on bg |
| --- | --- | --- | --- | --- |
| bg | `#EAF2FB` | background | `#02030A` | background |
| surface | `#FFFFFF` | 1.13:1 | `#0A0D1E` | 1.07:1 |
| text | `#0A1430` | 16.09:1 | `#EAF0FF` | 18.05:1 |
| muted | `#4A5878` | 6.28:1 | `#9AA6CC` | 8.53:1 |
| accent | `#A63A08` | 5.76:1 | `#FF9F43` | 10.09:1 |
| data | `#0B5CAD` | 5.91:1 | `#7DD3FC` | 12.35:1 |
| dim | `#C8D6EA` | decorative only (empty/off states, never text) | `#1E2548` | decorative only (empty/off states, never text) |
<!-- /palette -->

## 5. Riso Manifesto

- **Idea:** a two-ink risograph protest poster. A giant overprinted number (the slowest median lag
  in years) with "That is how long Zulu waits"; twenty halftone stamps whose dot size is coverage.
- **Mood:** loud, activist, print-shop; fluorescent pink over blue with misregistration.
- **Typography:** Anton for display; Archivo for body.
- **Layout:** poster split (number / statement), then a stamp grid; stacks to one column on phones.
- **Languages lighting up:** the halftone stamps.
- **Pipeline Live hero:** giant "523 wikis heard. Live. For $0." with a halftone column chart of
  events per measured hour (one dot ≈ 1/18 of the peak hour, stated) and rubber-stamp engine tags
  (solid "ran", dashed "not in last run").
- **Motion:** the current replay column prints at full ink; others stay faded.
- **Accessibility:** the big number is `aria-hidden` and repeated in the headline text; stamps are
  labelled. The pink/blue inks are decorative; text uses the AA tokens below.
- **Palette:** (decorative inks `#FF48B0` and `#0078BF`, never for text)
<!-- palette:riso -->
| role | light hex | on bg | dark hex | on bg |
| --- | --- | --- | --- | --- |
| bg | `#F6F0E1` | background | `#14112B` | background |
| surface | `#FFF9EC` | 1.08:1 | `#1E1A3D` | 1.11:1 |
| text | `#1B1464` | 13.88:1 | `#FFF4E0` | 16.83:1 |
| muted | `#4B4683` | 7.38:1 | `#C2B8E0` | 9.81:1 |
| accent | `#B8005A` | 5.80:1 | `#FF6EC4` | 7.23:1 |
| data | `#005E9E` | 5.97:1 | `#4FC3FF` | 9.24:1 |
| dim | `#E6DCC4` | decorative only (empty/off states, never text) | `#2E2858` | decorative only (empty/off states, never text) |
<!-- /palette -->

## 6. Babel Tower

- **Idea:** the name made literal. An isometric tower of twenty floors, each as wide as its
  language's coverage and coloured deeper the longer its median wait; it tapers fast into the sky.
- **Mood:** architectural, warm sandstone at dusk; a little mythic.
- **Typography:** Fraunces (heavy, soft serif) for headlines; Work Sans for body.
- **Layout:** headline, then the tower with a labelled leader line per floor.
- **Languages lighting up:** the tower floors.
- **Pipeline Live hero:** "The building site": stage blocks (tall and lit only if the engine ran in
  the last run) under an isometric skyline of events per measured hour.
- **Motion:** the replayed hour's column is solid; others are faded.
- **Accessibility:** every floor is labelled with name, coverage and years.
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

---

## Logo directions (`logos/`)

Each SVG switches ink via `prefers-color-scheme`, and in the site takes the concept's tokens.
[`logos/check.html`](logos/check.html) renders them at 16, 32, 64 and 128 px;
[`screens/logos-light.png`](screens/logos-light.png) and
[`screens/logos-dark.png`](screens/logos-dark.png) show the result.

| | Direction | Idea | Favicon check |
| --- | --- | --- | --- |
| A | `a-halflit.svg` | A heavy **B** lit only on its left third; the rest in the dark. Pairs with Blackout, Light-years. | Reads at 16 px in both themes. |
| B | `b-flap.svg` | A split-flap tile with a lit **B** and the hinge line. Pairs with Departures, Riso. | Strongest at 16 px; tile stays dark in both themes. |
| C | `c-phase.svg` | A crescent moon (lit share) fed by a small source dot. Pairs with Light-years, Seismograph. | 16 px reads as a crescent; the source dot fades, so drop it in the favicon variant. |
| D | `d-tower.svg` | A stepped isometric tower whose top floor is lit and the peak unlit. Pairs with Babel Tower. | Reads as a stepped pyramid at 16 px; fine detail lost, acceptable. |

## Owner's choice

Pick one concept (1 to 6) and one logo (A to D). Mixing is possible (for example Blackout with
logo B). The build then uses only that design.
