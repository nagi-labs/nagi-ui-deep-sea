import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
  await expect(page.getByRole("table", { name: "Priority monitoring stations" })).toBeVisible();

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

test("the Overview Combobox keeps showcase motion when the browser requests reduction", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const captureWindow = window as Window & { __overviewComboboxDurations?: number[] };
    const nativeAnimate = Element.prototype.animate;
    captureWindow.__overviewComboboxDurations = [];
    Element.prototype.animate = function captureOverviewComboboxMotion(keyframes, options) {
      const animation = nativeAnimate.call(this, keyframes, options);
      if (this.matches("[data-motion-combobox-surface]")) {
        captureWindow.__overviewComboboxDurations?.push(
          Number(animation.effect?.getTiming().duration ?? 0),
        );
      }
      return animation;
    };
  });
  await page.goto("/");
  await page.getByRole("combobox", { name: "Find another station" }).click();

  await expect
    .poll(async () =>
      (
        await page.evaluate(
          () =>
            (window as Window & { __overviewComboboxDurations?: number[] })
              .__overviewComboboxDurations ?? [],
        )
      ).some((duration) => duration > 20),
    )
    .toBe(true);
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
      const sidebar = document.querySelector(".n-sidebar.-app")?.getBoundingClientRect();
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

test("the owned source map exposes Definition status", async ({ page }) => {
  await page.goto("/components");

  await expect(
    page.getByRole("heading", { level: 1, name: "Owned component source" }),
  ).toBeVisible();
  await expect(page.getByText("13", { exact: true })).toBeVisible();
  await expect(page.getByText("Definition verified").first()).toBeVisible();
  await expect(page.getByText("Definition WIP").first()).toBeVisible();
});
