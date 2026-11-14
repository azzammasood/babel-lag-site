import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Fmt, show } from "../../src/lib/format";
import { pointer } from "../../src/lib/pointer";
import { pages } from "./pages";

// The site's core promise: every figure is read from an export, and matches it.
// 1. Each traced value (<V>) is looked up again in the export and formatted again.
// 2. Any other digit in the page text must sit inside an explicit <S> (not data).
const DATA = process.env.BABEL_DATA_DIR ?? join("data", "site");
const cache = new Map<string, unknown>();
const doc = (name: string) => {
  if (!cache.has(name)) cache.set(name, JSON.parse(readFileSync(join(DATA, name), "utf8")));
  return cache.get(name);
};

test.use({ reducedMotion: "reduce" });

for (const path of pages()) {
  test(`every figure on /${path} comes from an export`, async ({ page }) => {
    await page.goto(path);
    const traced = await page.$$eval("main [data-src]", (els) =>
      els.map((e) => ({ src: e.getAttribute("data-src")!, as: e.getAttribute("data-as")!, text: e.textContent ?? "" })),
    );
    const wrong: string[] = [];
    for (const t of traced) {
      const hash = t.src.indexOf("#");
      const value = pointer(doc(t.src.slice(0, hash)), t.src.slice(hash + 1));
      if (value === undefined) wrong.push(`${t.src}: not in the export`);
      else if (show(value, t.as as Fmt) !== t.text) wrong.push(`${t.src}: page "${t.text}", export "${show(value, t.as as Fmt)}"`);
    }
    expect(wrong, wrong.join("\n")).toEqual([]);

    const loose = await page.evaluate(() => {
      const out: string[] = [];
      const main = document.querySelector("main");
      if (!main) return ["no <main>"];
      const walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const el = n.parentElement;
        if (!el || !/\d/.test(n.textContent ?? "") || el.closest("script,style,[data-src],[data-static]")) continue;
        out.push(`<${el.tagName.toLowerCase()}> "${(n.textContent ?? "").trim().slice(0, 80)}"`);
      }
      return out;
    });
    expect(loose, `untraced digits:\n${loose.join("\n")}`).toEqual([]);
  });
}
