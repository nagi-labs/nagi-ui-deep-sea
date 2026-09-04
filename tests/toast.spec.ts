import { expect, test, type Page } from "@playwright/test";

import {
  componentImplementationAnnotation,
  componentImplementationRequirementsAnnotation,
  inspectAnatomy,
  toastContract,
} from "@nagi-labs/nagi-ui/test";
import { toastDefinition } from "../src/definitions/toast.definition";

toastContract({
  definition: toastDefinition,
  url: "/toast-contract",
  regionName: "Deep Sea contract notifications",
  secondaryRegionName: "Deep Sea secondary notifications",
});

const implementationRequirementIds = [
  "DEEP_SEA_TOAST_IMPLEMENTATION_01",
  "DEEP_SEA_TOAST_IMPLEMENTATION_02",
  "DEEP_SEA_TOAST_IMPLEMENTATION_03",
] as const;

test.describe(
  "Toast / Implementation / Deep Sea Motion stack",
  {
    tag: ["@definition", "@toast", "@implementation"],
    annotation: [
      componentImplementationAnnotation(toastDefinition),
      componentImplementationRequirementsAnnotation(implementationRequirementIds),
    ],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/toast-contract");
    });

    async function DEEP_SEA_TOAST_IMPLEMENTATION_01({ page }: { page: Page }) {
      await page.getByRole("button", { name: "Show toast", exact: true }).click();
      const root = page.locator(".n-toast").first();
      const region = page.getByRole("region", {
        name: "Deep Sea contract notifications",
        exact: true,
      });

      expect(await root.evaluate(inspectAnatomy, toastDefinition.anatomy)).toEqual([]);
      await expect(region).toHaveJSProperty("popover", "manual");
      await expect(region).toHaveCSS("display", "block");
      await expect(
        region.locator("[data-motion-toast-stack] > [data-motion-toast-item]"),
      ).toHaveCount(1);
    }

    test(
      "Keeps the Motion stack inside one native manual-popover renderer",
      {
        tag: ["@anatomy", "@semantics", `@${DEEP_SEA_TOAST_IMPLEMENTATION_01.name}`],
      },
      DEEP_SEA_TOAST_IMPLEMENTATION_01,
    );

    async function DEEP_SEA_TOAST_IMPLEMENTATION_02({ page }: { page: Page }) {
      const trigger = page.getByRole("button", { name: "Show undo toast", exact: true });
      await trigger.click();
      await page.keyboard.press("F6");
      await page.keyboard.press("Tab");
      const region = page.getByRole("region", {
        name: "Deep Sea contract notifications",
        exact: true,
      });
      await expect(region.getByRole("button", { name: "Undo", exact: true })).toBeFocused();

      await page
        .getByRole("button", { name: "Close all notifications", exact: true })
        .evaluate((button: HTMLButtonElement) => button.click());
      await expect(trigger).toBeFocused();
      await expect(region.locator("[data-motion-toast-item]")).toHaveCount(1);
      await expect(region.locator("[data-motion-toast-item]")).toHaveCount(0, { timeout: 1000 });
    }

    test(
      "Repairs focus before externally removed notification exit DOM is released",
      {
        tag: ["@interaction", "@focus", `@${DEEP_SEA_TOAST_IMPLEMENTATION_02.name}`],
      },
      DEEP_SEA_TOAST_IMPLEMENTATION_02,
    );

    async function DEEP_SEA_TOAST_IMPLEMENTATION_03({ page }: { page: Page }) {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await page.evaluate(() => {
        const captureWindow = window as Window & { __toastMotionDurations?: number[] };
        const nativeAnimate = Element.prototype.animate;
        captureWindow.__toastMotionDurations = [];
        Element.prototype.animate = function captureToastMotion(keyframes, options) {
          const animation = nativeAnimate.call(this, keyframes, options);
          if (this.matches("[data-motion-toast-item], [data-motion-toast-stack]")) {
            captureWindow.__toastMotionDurations?.push(
              Number(animation.effect?.getTiming().duration ?? 0),
            );
          }
          return animation;
        };
      });

      await page.getByRole("button", { name: "Fill toast limit", exact: true }).click();
      const region = page.getByRole("region", {
        name: "Deep Sea contract notifications",
        exact: true,
      });
      const stack = region.locator("[data-motion-toast-stack]");
      const items = stack.locator("[data-motion-toast-item]");
      await expect(items).toHaveCount(3);
      await expect(stack).toHaveAttribute("data-motion-policy", "animated");
      await expect
        .poll(async () =>
          (
            await page.evaluate(
              () =>
                (window as Window & { __toastMotionDurations?: number[] }).__toastMotionDurations ??
                [],
            )
          ).some((duration) => duration > 20),
        )
        .toBe(true);

      await items.first().getByRole("button", { name: "Dismiss notification" }).click();
      await expect(items).toHaveCount(2, { timeout: 1000 });
    }

    test(
      "Animates insertion, vertical reflow, and removal with keyed layout items",
      {
        tag: ["@style", "@interaction", `@${DEEP_SEA_TOAST_IMPLEMENTATION_03.name}`],
      },
      DEEP_SEA_TOAST_IMPLEMENTATION_03,
    );
  },
);
