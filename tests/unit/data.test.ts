import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain ESM scripts without types
import { derive } from "../../scripts/derive.mjs";
// @ts-expect-error plain ESM scripts without types
import { makeValidator } from "../../scripts/exports.mjs";
import { FMT, show } from "../../src/lib/format";
import { pointer } from "../../src/lib/pointer";

const fx = (name: string) => JSON.parse(readFileSync(`fixtures/site-data/${name}`, "utf8"));

describe("exports", () => {
  const validate = makeValidator("schemas");
  it.each([
    ["languages.json", "languages_row.schema.json"],
    ["live.json", "live_row.schema.json"],
    ["pipeline_metrics.json", "pipeline_metrics.schema.json"],
  ])("%s matches the pipeline schema", (file, schema) => {
    expect(validate(schema, fx(file))).toBeNull();
  });

  it("a broken export is rejected", () => {
    const bad = fx("languages.json");
    bad.rows[0].coverage_pct = "lots";
    expect(validate("languages_row.schema.json", bad)).not.toBeNull();
  });
});

describe("derived.json", () => {
  const live = fx("live.json");
  const d = derive(live);
  it("hourly sums add up to the rows", () => {
    const total = live.rows.reduce((s: number, r: { events: number }) => s + r.events, 0);
    expect(d.totals.events).toBe(total);
    expect(d.hourly.reduce((s: number, h: { events: number }) => s + h.events, 0)).toBe(total);
    expect(Object.values(d.by_wiki).reduce((s: number, w) => s + (w as { events: number }).events, 0)).toBe(total);
  });
  it("counts wikis and the busiest hour from the rows", () => {
    expect(d.wikis).toBe(new Set(live.rows.map((r: { wiki: string }) => r.wiki)).size);
    const first = d.hourly[0];
    const rows = live.rows.filter((r: { hour: string }) => r.hour === first.hour);
    expect(first.wikis_active).toBe(rows.filter((r: { events: number }) => r.events > 0).length);
    expect(d.peak_hour_events).toBe(Math.max(...d.hourly.map((h: { events: number }) => h.events)));
  });
});

describe("formats", () => {
  it("years are days over 365.25, one decimal", () => {
    expect(FMT.years(3917.7)).toBe("10.7");
    expect(FMT.years(1037.6)).toBe("2.8");
  });
  it("a missing value is never shown as a number", () => {
    expect(show(null, "int")).toBe("not measured");
  });
  it("pointers resolve nested values", () => {
    expect(pointer({ a: [{ b: 2 }] }, "/a/0/b")).toBe(2);
    expect(pointer({ a: 1 }, "/x")).toBeUndefined();
  });
});
