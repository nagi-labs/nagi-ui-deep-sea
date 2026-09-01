import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the command deck is operable and accessible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Network overview" })).toBeVisible();
  await expect(
    page.getByRole("figure", { name: /Kermadec 07 signal quality over the last 12 hours/u }),
  ).toBeVisible();
  await expect(page.getByRole("table", { name: "Priority monitoring stations" })).toBeVisible();

  await page.getByRole("button", { name: "Create report" }).click();
  await expect(page.getByRole("dialog", { name: "Create network report" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Sync data" }).click();
  await expect(page.getByText("Updated just now")).toBeVisible();

  await expect(page.getByRole("combobox", { name: "Find another station" })).toBeVisible();
  const chartLine = page.locator('[data-nagi-unovis] path[stroke="var(--vis-color0)"]');
  const chartBeforeSelection = await chartLine.getAttribute("d");

  await page.getByRole("button", { name: "Clarion 12", exact: true }).click();
  await expect(page.locator(".station-tab-indicator")).not.toHaveCSS("transform", "none");
  await page.waitForTimeout(120);
  const chartDuringSelection = await chartLine.getAttribute("d");
  await page.waitForTimeout(850);
  const chartAfterSelection = await chartLine.getAttribute("d");

  expect(chartDuringSelection).not.toBe(chartBeforeSelection);
  expect(chartDuringSelection).not.toBe(chartAfterSelection);
  await expect(
    page.getByRole("figure", { name: /Clarion 12 signal quality over the last 12 hours/u }),
  ).toBeVisible();
  await expect(page.getByText("51.6 MPa")).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("the owned source map exposes Definition status", async ({ page }) => {
  await page.goto("/#/components");

  await expect(
    page.getByRole("heading", { level: 1, name: "Owned component source" }),
  ).toBeVisible();
  await expect(page.getByText("64", { exact: true })).toBeVisible();
  await expect(page.getByText("Definition verified").first()).toBeVisible();
  await expect(page.getByText("Definition WIP").first()).toBeVisible();
});
