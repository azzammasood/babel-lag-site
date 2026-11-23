import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mainPages } from "./pages";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const theme of ["dark", "light", "babel"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ reducedMotion: "reduce" });
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("babel-mode", t), theme);
    });
    for (const path of mainPages()) {
      test(`axe: /${path}`, async ({ page }) => {
        test.setTimeout(120_000); // the language index is a table of several hundred rows
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

test("the theme button walks Dark, Light, Babel and is remembered", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("method/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-mode", "dark");
  const button = page.getByRole("button", { name: /^Colour theme/ });
  await button.click();
  await expect(html).toHaveAttribute("data-mode", "light");
  await button.click();
  await expect(html).toHaveAttribute("data-mode", "babel");
  await page.reload();
  await expect(html).toHaveAttribute("data-mode", "babel");
  await page.getByRole("button", { name: /^Colour theme/ }).click();
  await expect(html).toHaveAttribute("data-mode", "dark");
});

test("the landing intro steps through to the tower and is not shown again in the session", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
  await page.goto("");
  const intro = page.locator("#intro");
  await expect(intro).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.length} nodes (${v.nodes[0]?.target})`)).toEqual([]);
  for (let i = 0; i < 3; i++) await page.locator("#intro .next").click();
  await expect(intro).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator("html")).not.toHaveClass(/(^|\s)intro(\s|$)/);
  await page.reload();
  await page.waitForTimeout(500);
  await expect(page.locator("#intro")).toHaveCount(0);
});

test("reduced motion skips the intro and shows the finished tower", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("");
  await expect(page.locator("#intro")).toHaveCount(0);
  await expect(page.locator(".ctl output")).toHaveText(/^Year /);
});
