# babel-lag-site

The public site for **Babel Lag**: when the world learns something new, how long until it reaches
each language on Wikipedia, and which languages stay in the dark? The data pipeline lives in
[`babel-lag-pipeline`](https://github.com/azzammasood/babel-lag-pipeline).

**Status: design gate.** Six concepts and four logo directions are in `docs/design/` for the owner
to choose from. No site is built until a design is picked.

- `docs/design/options.md`: the six concepts (idea, palette with WCAG contrast, type, layout,
  motion, accessibility) and logo notes.
- `docs/design/preview.html`: open by double-click. Home (Now) and Pipeline Live for each concept,
  light and dark, using real sample exports from `docs/design/sample-data/`.
- `docs/design/screens/`: screenshots (desktop light/dark, Pipeline Live, phone width, logo sizes).
- Rebuild the preview after changing data, palettes or logos: `python docs/design/tools/build.py`.

Data: Wikimedia Foundation (EventStreams, MediaWiki history dumps, pageview dumps, Wikidata),
CC0. Independent and non-commercial; not affiliated with the Wikimedia Foundation.
Code: MIT (see `LICENSE`).
