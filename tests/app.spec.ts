import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { testedContractEvidence } from "../src/data/components";

test("the overview is prerendered and hydrates without a mismatch", async ({ page, request }) => {
  const response = await request.get("/");
  const html = await response.text();
  const hydrationProblems: string[] = [];
  page.on("console", (message) => {
    if (/hydration|mismatch/iu.test(message.text())) hydrationProblems.push(message.text());
  });

  expect(html).toContain('<div id="app"><div class="deep-sea-app"');
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Network overview" })).toBeVisible();
  expect(hydrationProblems).toEqual([]);
});

test("the command deck is operable and accessible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Network overview" })).toBeVisible();
  await expect(page.getByText("Demo data · Pacific monitoring network")).toBeVisible();
  await expect(page.getByRole("table", { name: "Priority monitoring stations" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View page source" })).toHaveAttribute(
    "href",
    "/components?source=page-dashboard-view",
  );
  await expect(page.getByRole("link", { name: "How Nagi CSS checks this" })).toHaveAttribute(
    "href",
    "https://nagi-labs.github.io/nagi-css/#test",
  );
  await expect(page.getByRole("link", { name: "Discuss ownership model" })).toHaveAttribute(
    "href",
    "https://github.com/nagi-labs/nagi-ui/issues/new?template=ownership-model-feedback.md",
  );

  await page.getByRole("button", { name: "Create report" }).click();
  await expect(page.getByRole("dialog", { name: "Create network report" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Sync data" }).click();
  await expect(page.getByText("Updated just now")).toBeVisible();

  await expect(page.getByRole("combobox", { name: "Find another station" })).toBeVisible();
  await page.getByRole("button", { name: "Clarion 12", exact: true }).click();
  await expect(page.getByText("82%", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("51.6 MPa")).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("Sync data presents the Overview notification stack", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sync data" }).click();

  const region = page.getByRole("region", { name: "Network activity" });
  await expect(region.locator("[data-motion-toast-item]")).toHaveCount(1);
  await expect(region).toContainText("Network synchronized");
});

test("the Overview respects reduced motion while keeping core operations available", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("combobox", { name: "Find another station" }).click();
  await expect(page.locator("[data-motion-combobox-surface]")).toHaveAttribute(
    "data-motion-policy",
    "reduced",
  );

  const trigger = page.getByRole("button", { name: "Create report" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Create network report" });
  await expect(dialog).toHaveAttribute("data-motion-policy", "reduced");
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.getByRole("button", { name: "Sync data" }).click();
  const stack = page.locator("[data-motion-toast-stack]");
  await expect(stack).toHaveAttribute("data-motion-policy", "reduced");
  await expect(page.getByRole("region", { name: "Network activity" })).toContainText(
    "Network synchronized",
  );
});

test("the initial route does not create transient horizontal overflow", async ({ page }) => {
  await page.addInitScript(() => {
    const captureWindow = window as Window & {
      __maximumHorizontalOverflow?: number;
      __metricTopSamples?: number[];
      __sidebarGeometrySamples?: Array<[number, number, number]>;
      __layoutSamplingComplete?: boolean;
    };
    captureWindow.__maximumHorizontalOverflow = 0;
    captureWindow.__metricTopSamples = [];
    captureWindow.__sidebarGeometrySamples = [];
    const startedAt = performance.now();
    let metricStartedAt: number | undefined;

    function sampleOverflow() {
      captureWindow.__maximumHorizontalOverflow = Math.max(
        captureWindow.__maximumHorizontalOverflow ?? 0,
        document.documentElement.scrollWidth - window.innerWidth,
      );
      const metricTop = document
        .querySelector(".section.-metrics > .article")
        ?.getBoundingClientRect().top;
      const sidebar = document.querySelector(".n-sidebar")?.getBoundingClientRect();
      if (sidebar) {
        captureWindow.__sidebarGeometrySamples?.push([sidebar.left, sidebar.width, sidebar.height]);
      }
      if (metricTop !== undefined) {
        metricStartedAt ??= performance.now();
        captureWindow.__metricTopSamples?.push(metricTop);
      }
      if (
        (metricStartedAt === undefined && performance.now() - startedAt < 3000) ||
        (metricStartedAt !== undefined && performance.now() - metricStartedAt < 800)
      ) {
        requestAnimationFrame(sampleOverflow);
      } else {
        captureWindow.__layoutSamplingComplete = true;
      }
    }

    requestAnimationFrame(sampleOverflow);
  });
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __layoutSamplingComplete?: boolean }).__layoutSamplingComplete ??
          false,
      ),
    )
    .toBe(true);

  expect(
    await page.evaluate(
      () =>
        (window as Window & { __maximumHorizontalOverflow?: number }).__maximumHorizontalOverflow ??
        0,
    ),
  ).toBe(0);
  const metricTopSamples = await page.evaluate(
    () => (window as Window & { __metricTopSamples?: number[] }).__metricTopSamples ?? [],
  );
  expect(metricTopSamples.length).toBeGreaterThan(1);
  expect(Math.max(...metricTopSamples) - Math.min(...metricTopSamples)).toBeLessThan(0.1);
  const sidebarGeometrySamples = await page.evaluate(
    () =>
      (window as Window & { __sidebarGeometrySamples?: Array<[number, number, number]> })
        .__sidebarGeometrySamples ?? [],
  );
  expect(sidebarGeometrySamples.length).toBeGreaterThan(1);
  expect(new Set(sidebarGeometrySamples.map((sample) => sample.join(","))).size).toBe(1);
});

test("the owned source map exposes Contract test status", async ({ page }) => {
  await page.goto("/components");

  await expect(
    page.getByRole("heading", { level: 1, name: "Owned component source" }),
  ).toBeVisible();
  await expect(page.getByText("13", { exact: true })).toBeVisible();
  await expect(page.getByText("Contract tested").first()).toBeVisible();
  await expect(page.getByText("Definition WIP").first()).toBeVisible();
});

test("every Contract tested label points to a registered shared runner", () => {
  for (const evidence of Object.values(testedContractEvidence)) {
    const source = readFileSync(resolve(evidence.test), "utf8");
    expect(source).toContain(`${evidence.runner}({`);
  }
});

test("the source explorer shows the exact page and owned component files", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "View page source" }).click();

  await expect(page).toHaveURL(/\/components\?source=page-dashboard-view$/u);
  await expect(page.getByRole("heading", { level: 2, name: "DashboardView.vue" })).toBeVisible();
  const sourceCode = page.getByLabel("DashboardView.vue source code");
  await expect(sourceCode).toContainText('<main class="main"');
  await expect(sourceCode).toContainText(".deep-sea-dashboard-view");

  await page.getByRole("button", { name: /Button\.vue Contract tested/u }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Button.vue" })).toBeVisible();
  await expect(page.getByLabel("Button.vue source code")).toContainText(
    "@deep-sea-source button/Button.vue",
  );

  await page.getByRole("button", { name: "button.definition.ts", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "button.definition.ts" })).toBeVisible();
  await expect(page.getByLabel("button.definition.ts source code")).toContainText(
    "buttonDefinition",
  );

  await page.getByRole("button", { name: /Toast\.vue Contract tested/u }).click();
  await page.getByRole("button", { name: "useDeepSeaToast.ts", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "useDeepSeaToast.ts" })).toBeVisible();
  await expect(page.getByLabel("useDeepSeaToast.ts source code")).toContainText("useDeepSeaToast");
});
