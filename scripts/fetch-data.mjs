// Bring the pipeline's exports into data/site/. Every file is checked against its JSON Schema;
// a file that fails is left out and recorded in data/site/_fetch.json with the reason, and the
// site shows that dataset as unavailable. Nothing is ever filled in.
//
//   node scripts/fetch-data.mjs                 # from fixtures/site-data (a snapshot of real exports)
//   node scripts/fetch-data.mjs --from DIR      # from a local export folder (babel-lag data/export/v1)
//   node scripts/fetch-data.mjs --strict        # exit 1 if any file is rejected
//
// The pipeline does not publish a release yet (milestone 3); until then the committed snapshot
// is the source. derived.json holds plain sums of live.json rows (by hour, by wiki) so pages do
// not ship the full hour x wiki table; tests/unit/data.test.ts recomputes it.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeValidator } from "./exports.mjs";
import { derive } from "./derive.mjs";

const OUT = "data/site";
const args = process.argv.slice(2);
const from = args.includes("--from") ? args[args.indexOf("--from") + 1] : "fixtures/site-data";
const strict = args.includes("--strict");
const validate = makeValidator("schemas");

// file -> schema (null: no published schema yet; checked for JSON only and recorded as such)
const FILES = {
  "languages.json": "languages_row.schema.json",
  "live.json": "live_row.schema.json",
  "pipeline_metrics.json": "pipeline_metrics.schema.json",
  "metadata_catalog.json": null,
  "metadata_glossary.json": null,
  "metadata_lineage.json": null,
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const report = { source: from, fetched_at: new Date().toISOString(), files: {} };
let rejected = 0;
const docs = {};
for (const [name, schema] of Object.entries(FILES)) {
  let reason = null;
  let buf = null;
  try {
    buf = readFileSync(join(from, name));
    docs[name] = JSON.parse(buf.toString("utf8"));
    if (schema) reason = validate(schema, docs[name]);
  } catch {
    reason = buf ? "not valid JSON" : `missing in ${from}`;
  }
  report.files[name] = reason ? { ok: false, reason } : { ok: true, schema: schema ?? "none published" };
  if (reason) {
    rejected++;
    delete docs[name];
    console.warn(`fetch-data: ${name} rejected: ${reason}`);
  } else writeFileSync(join(OUT, name), buf);
}
if (docs["live.json"]) {
  writeFileSync(join(OUT, "derived.json"), JSON.stringify(derive(docs["live.json"])));
  report.files["derived.json"] = { ok: true, schema: "sums of live.json rows" };
}
writeFileSync(join(OUT, "_fetch.json"), JSON.stringify(report, null, 2));
console.log(`fetch-data: ${Object.keys(FILES).length - rejected} of ${Object.keys(FILES).length} exports accepted from ${from}`);
process.exitCode = strict && rejected ? 1 : 0;
