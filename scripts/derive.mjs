// Plain sums of live.json rows. No estimates: every value is a sum or a count of export rows.
const KEYS = ["events", "late_events", "human_article_edits", "new_articles", "bot_events"];

export function derive(live) {
  const hours = new Map();
  const wikis = new Map();
  for (const r of live.rows) {
    const h = hours.get(r.hour) ?? { hour: r.hour, ...Object.fromEntries(KEYS.map((k) => [k, 0])), wikis_active: 0 };
    const w = wikis.get(r.wiki) ?? { wiki: r.wiki, ...Object.fromEntries(KEYS.map((k) => [k, 0])) };
    for (const k of KEYS) {
      h[k] += r[k] ?? 0;
      w[k] += r[k] ?? 0;
    }
    if ((r.events ?? 0) > 0) h.wikis_active += 1;
    hours.set(r.hour, h);
    wikis.set(r.wiki, w);
  }
  const hourly = [...hours.values()].sort((a, b) => a.hour.localeCompare(b.hour));
  const byWiki = Object.fromEntries([...wikis.entries()].sort(([a], [b]) => a.localeCompare(b)));
  return {
    source: "live.json",
    window: live.window,
    wikis: wikis.size,
    hourly,
    peak_hour_events: Math.max(0, ...hourly.map((h) => h.events)),
    totals: Object.fromEntries(KEYS.map((k) => [k, hourly.reduce((s, h) => s + h[k], 0)])),
    by_wiki: byWiki,
  };
}
