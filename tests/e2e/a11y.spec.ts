import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mainPages } from "./pages";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme, reducedMotion: "reduce" });
    for (const path of mainPages()) {
      test(`axe: /${path}`, async ({ page }) => {
        await page.goto(path);
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(r.violations.map((v) => `${v.id}: ${v.nodes.length} nodes (${v.nodes[0]?.target})`)).toEqual([]);
      });
    }
  });
}

test("the home page does not scroll sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["", "pipeline/", "languages/"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(375);
  }
});

test("the colour mode toggle switches and is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("languages/");
  await page.getByRole("button", { name: "Switch colour mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
});
