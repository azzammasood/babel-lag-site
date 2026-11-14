import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Every exported page, found from out/ so a new page is tested without editing this list.
export function pages(dir = "out", prefix = ""): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory() || name.startsWith("_") || name === "404") continue;
    if (readdirSync(p).includes("index.html")) found.push(`${prefix}${name}/`);
    found.push(...pages(p, `${prefix}${name}/`));
  }
  return prefix ? found : ["", ...found];
}

// The main pages plus a few per-language pages: enough for the accessibility check.
export function mainPages(): string[] {
  const all = pages();
  const langs = all.filter((p) => /^languages\/[^/]+\/$/.test(p));
  return [...all.filter((p) => !langs.includes(p)), ...langs.slice(0, 2), ...langs.slice(-1)];
}
