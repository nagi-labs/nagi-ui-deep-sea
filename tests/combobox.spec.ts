import { expect, test, type Page } from "@playwright/test";

import {
  comboboxContract,
  componentImplementationAnnotation,
  componentImplementationRequirementsAnnotation,
  inspectAnatomy,
} from "@nagi-labs/nagi-ui/test";
import { comboboxDefinition } from "../src/components/nagi/combobox/combobox.definition";

comboboxContract({
  definition: comboboxDefinition,
  includeStandardImplementation: false,
  url: "/combobox-contract",
  name: "Deep Sea framework",
  inputStatusName: "Deep Sea combobox input",
  selectionStatusName: "Deep Sea combobox selection",
  removeActiveName: "Remove Deep Sea active option",
});

const implementationRequirementIds = [
  "DEEP_SEA_COMBOBOX_IMPLEMENTATION_01",
  "DEEP_SEA_COMBOBOX_IMPLEMENTATION_02",
  "DEEP_SEA_COMBOBOX_IMPLEMENTATION_03",
] as const;

test.describe(
  "Combobox / Implementation / Deep Sea Motion popover",
  {
    tag: ["@definition", "@combobox", "@implementation"],
    annotation: [
      componentImplementationAnnotation(comboboxDefinition),
      componentImplementationRequirementsAnnotation(implementationRequirementIds),
    ],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/combobox-contract");
    });

    async function DEEP_SEA_COMBOBOX_IMPLEMENTATION_01({ page }: { page: Page }) {
      const input = page.getByRole("combobox", { name: "Deep Sea framework", exact: true });
      await input.focus();
      await page.keyboard.press("ArrowDown");
      const root = page.locator('[data-scope="combobox"][data-part="root"]');
      const popup = root.locator('[data-scope="combobox"][data-part="popup"]');

      expect(await root.evaluate(inspectAnatomy, comboboxDefinition.anatomy)).toEqual([]);
      await expect(popup).toHaveJSProperty("popover", "auto");
      await expect(popup).toHaveCSS("display", "block");
      await expect(input).toBeFocused();
    }

    test(
      "Keeps one Motion popup inside the native auto-popover Combobox scope",
      {
        tag: ["@anatomy", "@semantics", `@${DEEP_SEA_COMBOBOX_IMPLEMENTATION_01.name}`],
      },
      DEEP_SEA_COMBOBOX_IMPLEMENTATION_01,
    );

    async function DEEP_SEA_COMBOBOX_IMPLEMENTATION_02({ page }: { page: Page }) {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await page.evaluate(() => {
        const captureWindow = window as Window & { __comboboxPopupDurations?: number[] };
        const nativeAnimate = Element.prototype.animate;
        captureWindow.__comboboxPopupDurations = [];
        Element.prototype.animate = function captureComboboxPopup(keyframes, options) {
          const animation = nativeAnimate.call(this, keyframes, options);
          if (this.matches("[data-motion-combobox-surface]")) {
            captureWindow.__comboboxPopupDurations?.push(
              Number(animation.effect?.getTiming().duration ?? 0),
            );
          }
          return animation;
        };
      });

      const input = page.getByRole("combobox", { name: "Deep Sea framework", exact: true });
      await input.focus();
      await page.keyboard.press("ArrowDown");
      await expect(input).toBeFocused();
      await expect(input).toHaveAttribute("aria-expanded", "true");
      await expect
        .poll(async () =>
          (
            await page.evaluate(
              () =>
                (window as Window & { __comboboxPopupDurations?: number[] })
                  .__comboboxPopupDurations ?? [],
            )
          ).some((duration) => duration > 20),
        )
        .toBe(true);

      await page.keyboard.press("Escape");
      await expect(input).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator('[data-scope="combobox"][data-part="popup"]')).toBeHidden();
    }

    test(
      "Runs spring popup entry while native Escape dismissal and input focus remain authoritative",
      {
        tag: ["@interaction", "@focus", `@${DEEP_SEA_COMBOBOX_IMPLEMENTATION_02.name}`],
      },
      DEEP_SEA_COMBOBOX_IMPLEMENTATION_02,
    );

    async function DEEP_SEA_COMBOBOX_IMPLEMENTATION_03({ page }: { page: Page }) {
      const input = page.getByRole("combobox", { name: "Deep Sea framework", exact: true });
      await input.focus();
      await page.keyboard.press("ArrowDown");
      const listbox = page.getByRole("listbox", { name: "Deep Sea framework" });
      await expect(listbox.getByRole("option", { name: "Vue" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      const indicatorSamplesPromise = listbox.evaluate(
        (element) =>
          new Promise<Array<{ top: number; transform: string }>>((resolve) => {
            function findTarget() {
              return [...element.querySelectorAll<HTMLElement>('[role="option"]')]
                .find((option) => option.textContent?.trim() === "Svelte")
                ?.querySelector<HTMLElement>("[data-motion-active-indicator]");
            }

            function sample(target: HTMLElement) {
              const samples: Array<{ top: number; transform: string }> = [];
              function nextFrame() {
                samples.push({
                  top: target.getBoundingClientRect().top,
                  transform: getComputedStyle(target).transform,
                });
                if (samples.length < 30) requestAnimationFrame(nextFrame);
                else resolve(samples);
              }
              requestAnimationFrame(nextFrame);
            }

            const ready = findTarget();
            if (ready) {
              sample(ready);
              return;
            }
            const observer = new MutationObserver(() => {
              const target = findTarget();
              if (!target) return;
              observer.disconnect();
              sample(target);
            });
            observer.observe(element, { childList: true, subtree: true });
          }),
      );
      await page.keyboard.press("ArrowDown");
      const svelte = listbox.getByRole("option", { name: "Svelte" });
      await expect(svelte).toHaveAttribute("aria-selected", "true");
      await expect(svelte.locator("[data-motion-active-indicator]")).toHaveCount(1);
      await expect(input).toBeFocused();
      const indicatorSamples = await indicatorSamplesPromise;
      expect(new Set(indicatorSamples.map((sample) => sample.transform)).size).toBeGreaterThan(1);
      expect(new Set(indicatorSamples.map((sample) => sample.top.toFixed(2))).size).toBeGreaterThan(
        1,
      );
    }

    test(
      "Moves one scoped shared-layout indicator without replacing active-descendant semantics",
      {
        tag: ["@style", "@focus", `@${DEEP_SEA_COMBOBOX_IMPLEMENTATION_03.name}`],
      },
      DEEP_SEA_COMBOBOX_IMPLEMENTATION_03,
    );
  },
);
