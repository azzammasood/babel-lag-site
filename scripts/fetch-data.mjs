// Bring the pipeline's exports into data/site/. Every file is checked against its JSON Schema;
// a file that fails is left out and recorded in data/site/_fetch.json with the reason, and the
// site shows that dataset as unavailable. Nothing is ever filled in.
//
//   node scripts/fetch-data.mjs                 # from fixtures/site-data (the committed snapshot; CI default)
//   node scripts/fetch-data.mjs --release       # from the pipeline release `site-data` (sequential, with a UA)
//   node scripts/fetch-data.mjs --from DIR      # from a local export folder
//   ... --strict                                # exit 1 if a required file is rejected or missing
//   ... --save DIR                              # also copy the accepted files to DIR (refresh the snapshot)
//
// derived.json holds plain sums of live.json rows (by hour, by wiki) so pages do not ship the full
// hour x wiki table; tests/unit/data.test.ts recomputes it.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeValidator } from "./exports.mjs";
import { derive } from "./derive.mjs";

const REPO = "azzammasood/babel-lag-pipeline";
const RELEASE = `https://github.com/${REPO}/releases/download/site-data/`;
const UA = "babel-lag-site (+https://github.com/azzammasood/babel-lag-site)";
const OUT = "data/site";

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const release = args.includes("--release");
const from = release ? RELEASE : (opt("--from") ?? "fixtures/site-data");
const strict = args.includes("--strict");
const save = opt("--save");
const validate = makeValidator("schemas");

// file -> { schema, optional }. schema null: no published schema yet, checked for JSON only.
// optional: a dataset the pipeline may not have published yet; its page shows an empty state.
const FILES = {
  "languages.json": { schema: "languages_row.schema.json" },
  "live.json": { schema: "live_row.schema.json" },
  "pipeline_metrics.json": { schema: "pipeline_metrics.schema.json" },
  "backtests.json": { schema: "backtests_row.schema.json", optional: true },
  "update_lag.json": { schema: "update_lag_row.schema.json", optional: true },
  "spreading.json": { schema: "spreading_row.schema.json", optional: true },
  "metadata_catalog.json": { schema: null },
  "metadata_glossary.json": { schema: null },
  "metadata_lineage.json": { schema: null },
};

async function get(name) {
  if (!release) {
    try {
      return readFileSync(join(from, name));
    } catch {
      return null;
    }
  }
  const res = await fetch(RELEASE + name, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
if (save) mkdirSync(save, { recursive: true });
const report = { source: from, fetched_at: new Date().toISOString(), files: {} };
let rejected = 0;
let accepted = 0;
const docs = {};
for (const [name, { schema, optional }] of Object.entries(FILES)) {
  let reason = null;
  const buf = await get(name);
  if (!buf) reason = optional ? "not published yet" : `missing in ${from}`;
  else {
    try {
      docs[name] = JSON.parse(buf.toString("utf8"));
      if (schema) reason = validate(schema, docs[name]);
    } catch {
      reason = "not valid JSON";
    }
  }
  report.files[name] = reason ? { ok: false, reason } : { ok: true, schema: schema ?? "none published" };
  if (reason) {
    delete docs[name];
    if (buf || !optional) {
      rejected++;
      console.warn(`fetch-data: ${name} rejected: ${reason}`);
    } else console.log(`fetch-data: ${name}: ${reason}`);
    continue;
  }
  accepted++;
  writeFileSync(join(OUT, name), buf);
  if (save) writeFileSync(join(save, name), buf);
}
if (docs["live.json"]) {
  writeFileSync(join(OUT, "derived.json"), JSON.stringify(derive(docs["live.json"])));
  report.files["derived.json"] = { ok: true, schema: "sums of live.json rows" };
}
writeFileSync(join(OUT, "_fetch.json"), JSON.stringify(report, null, 2));
console.log(`fetch-data: ${accepted} of ${Object.keys(FILES).length} exports accepted from ${from}`);
// Exit by exitCode, not process.exit(): exiting while fetch sockets close trips a libuv assert on Windows.
process.exitCode = strict && rejected ? 1 : 0;
