// Display formats for exported values. The trace test re-applies the same function to the export
// value and compares it with the page text, so a figure cannot drift from its source.
const num = (v: unknown) => Number(v);
export const NOT_MEASURED = "not measured";

export const FMT = {
  raw: (v: unknown) => String(v),
  int: (v: unknown) => num(v).toLocaleString("en-US"),
  f1: (v: unknown) => num(v).toLocaleString("en-US", { maximumFractionDigits: 1 }),
  // days -> years, one decimal
  years: (v: unknown) => (num(v) / 365.25).toLocaleString("en-US", { maximumFractionDigits: 1 }),
  // seconds -> minutes, one decimal
  minutes: (v: unknown) => (num(v) / 60).toLocaleString("en-US", { maximumFractionDigits: 1 }),
  gb: (v: unknown) => (num(v) / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 }),
  date: (v: unknown) => String(v).slice(0, 16).replace("T", " "),
  day: (v: unknown) => String(v).slice(0, 10),
  hour: (v: unknown) => String(v).slice(5, 13).replace("T", " ") + "h",
  id8: (v: unknown) => String(v).slice(0, 8),
  len: (v: unknown) => String(Array.isArray(v) ? v.length : Object.keys(v as object).length),
} as const;

export type Fmt = keyof typeof FMT;

export function show(v: unknown, as: Fmt): string {
  return v === null || v === undefined ? NOT_MEASURED : FMT[as](v);
}
