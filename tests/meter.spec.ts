import { expect, test } from "@playwright/test";

test("Meter preserves native semantics and animates initial and changed values", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  const html = await response.text();
  expect(html).toMatch(/data-part="indicator"[^>]*style="[^"]*scaleX\(0\)/u);

  await page.addInitScript(() => {
    const captureWindow = window as Window & {
      __meterMotionSamples?: Record<string, number[]>;
    };
    captureWindow.__meterMotionSamples = {};

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const indicator = mutation.target;
        if (!(indicator instanceof HTMLElement) || !indicator.matches('[data-part="indicator"]')) {
          continue;
        }
        const label = indicator
          .closest('[data-scope="meter"]')
          ?.querySelector("label")?.textContent;
        const match = indicator.style.transform.match(/scaleX\(([^)]+)\)/u);
        if (!label || !match) continue;
        const samples = (captureWindow.__meterMotionSamples ??= {});
        (samples[label] ??= []).push(Number(match[1]));
      }
    });
    observer.observe(document, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
  });

  await page.goto("/");

  const signal = page.getByRole("meter", { name: "Signal" });
  const battery = page.getByRole("meter", { name: "Battery" });
  const capacity = page.getByRole("meter", { name: "Sample capacity" });
  const indicators = page.locator('[data-scope="meter"] [data-part="indicator"]');
  const indicatorScales = () =>
    indicators.evaluateAll((elements) =>
      elements.map((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a),
    );
  await expect(signal).toHaveAttribute("value", "96");
  await expect(battery).toHaveAttribute("value", "78");
  await expect(capacity).toHaveAttribute("value", "61");
  await expect(page.locator(".deep-sea-dashboard-view > .main")).toBeVisible();
  await expect
    .poll(async () => (await indicatorScales()).map((scale) => Number(scale.toFixed(2))))
    .toEqual([0.96, 0.78, 0.61]);
  const initialMotionSamples = await page.evaluate(
    () =>
      (window as Window & { __meterMotionSamples?: Record<string, number[]> })
        .__meterMotionSamples ?? {},
  );
  expect(initialMotionSamples.Signal?.some((scale) => scale > 0 && scale < 0.96)).toBe(true);
  expect(initialMotionSamples.Battery?.some((scale) => scale > 0 && scale < 0.78)).toBe(true);
  expect(initialMotionSamples["Sample capacity"]?.some((scale) => scale > 0 && scale < 0.61)).toBe(
    true,
  );

  await page.evaluate(() => {
    (window as Window & { __meterMotionSamples?: Record<string, number[]> }).__meterMotionSamples =
      {};
  });

  await page.getByRole("button", { name: "Clarion 12", exact: true }).click();

  await expect(signal).toHaveAttribute("value", "82");
  await expect(battery).toHaveAttribute("value", "64");
  await expect(capacity).toHaveAttribute("value", "43");
  await expect
    .poll(async () => (await indicatorScales()).map((scale) => Number(scale.toFixed(2))))
    .toEqual([0.82, 0.64, 0.43]);
  const changedMotionSamples = await page.evaluate(
    () =>
      (window as Window & { __meterMotionSamples?: Record<string, number[]> })
        .__meterMotionSamples ?? {},
  );
  expect(changedMotionSamples.Signal?.some((scale) => scale > 0.82 && scale < 0.96)).toBe(true);
  expect(changedMotionSamples.Battery?.some((scale) => scale > 0.64 && scale < 0.78)).toBe(true);
  expect(
    changedMotionSamples["Sample capacity"]?.some((scale) => scale > 0.43 && scale < 0.61),
  ).toBe(true);
});
