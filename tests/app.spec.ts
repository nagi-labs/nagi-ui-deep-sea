import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the command deck is operable and accessible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Command deck" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Priority observation stations" })).toBeVisible();

  await page.getByRole("button", { name: "Plan a dive" }).click();
  await expect(page.getByRole("dialog", { name: "Plan a dive" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("the owned source map exposes Definition status", async ({ page }) => {
  await page.goto("/#/components");

  await expect(
    page.getByRole("heading", { level: 1, name: "The whole system is here." }),
  ).toBeVisible();
  await expect(page.getByText("64", { exact: true })).toBeVisible();
  await expect(page.getByText("Definition verified").first()).toBeVisible();
  await expect(page.getByText("Definition WIP").first()).toBeVisible();
});
