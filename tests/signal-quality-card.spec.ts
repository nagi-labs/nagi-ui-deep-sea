import { expect, test } from "@playwright/test";

test("DashboardSkeleton covers the page until its minimum delay and Unovis render complete", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  const response = await request.get("/");
  const html = await response.text();

  expect(html).toContain('class="deep-sea-dashboard-view"');
  expect(html).toContain('class="deep-sea-dashboard-skeleton"');
  expect(html).toContain('aria-label="Loading dashboard"');

  await page.goto("/");

  const stage = page.locator(".deep-sea-dashboard-view");
  const dashboard = stage.locator(".main");
  const skeleton = stage.locator(".deep-sea-dashboard-skeleton");

  await expect(stage).toHaveAttribute("aria-busy", "true");
  await expect(skeleton).toBeVisible();
  await expect(dashboard).toBeHidden();
  const firstSkeleton = skeleton.locator(".n-skeleton").first();
  const initialBackgroundPosition = await firstSkeleton.evaluate(
    (element) => getComputedStyle(element).backgroundPosition,
  );
  await page.waitForTimeout(120);
  await expect
    .poll(() => firstSkeleton.evaluate((element) => getComputedStyle(element).backgroundPosition))
    .not.toBe(initialBackgroundPosition);
  expect(
    await dashboard.evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(",")
        .some((duration) => Number.parseFloat(duration) >= 0.4),
    ),
  ).toBe(true);

  await expect(stage).toHaveAttribute("aria-busy", "false");
  await expect(dashboard).toHaveAttribute("data-ready", "true");
  await expect(skeleton).toBeHidden();
  await expect(dashboard.locator(".deep-sea-signal-quality-card > .n-card")).toHaveAttribute(
    "data-rendered",
    "true",
  );
  await expect(dashboard.locator(".deep-sea-signal-quality-card .figure svg")).toBeVisible();

  const initialBounds = await dashboard.boundingBox();

  await dashboard.getByRole("button", { name: "Clarion 12", exact: true }).click();
  await expect(dashboard.getByText("82%", { exact: true }).first()).toBeVisible();
  expect(await dashboard.boundingBox()).toEqual(initialBounds);
});
