import { expect, test, type Locator } from "@playwright/test";

import {
  componentImplementationAnnotation,
  componentImplementationRequirementsAnnotation,
  dialogContract,
} from "@nagi-labs/nagi-ui/test";
import { dialogDefinition } from "../src/components/nagi/dialog/dialog.definition";

dialogContract({
  definition: dialogDefinition,
  includeStandardImplementation: false,
  url: "/dialog-contract",
  triggerName: "Open Deep Sea dialog",
  dialogName: "Deep Sea handover",
  description: "Review the operational handover before saving it.",
  closeName: "Close",
  actionName: "Save handover",
  modelStatusName: "Deep Sea dialog model",
});

const implementationRequirementIds = [
  "DEEP_SEA_DIALOG_IMPLEMENTATION_01",
  "DEEP_SEA_DIALOG_IMPLEMENTATION_02",
  "DEEP_SEA_DIALOG_IMPLEMENTATION_03",
] as const;

function sampleSurfaceAfterState(dialog: Locator, state: "open" | "closing") {
  return dialog.evaluate(async (element, expectedState) => {
    const dialogElement = element as HTMLDialogElement;
    await new Promise<void>((resolve) => {
      function ready() {
        return (
          dialogElement.dataset.motionState === expectedState &&
          dialogElement.querySelector("[data-motion-dialog-surface]")
        );
      }

      if (ready()) {
        resolve();
        return;
      }

      const observer = new MutationObserver(() => {
        if (!ready()) return;
        observer.disconnect();
        resolve();
      });
      observer.observe(dialogElement, {
        attributes: true,
        attributeFilter: ["data-motion-state"],
        childList: true,
        subtree: true,
      });
    });

    const surface = dialogElement.querySelector("[data-motion-dialog-surface]");
    if (!surface) throw new Error("Dialog Motion surface is missing.");
    const samples: string[] = [];
    for (let index = 0; index < 30; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      samples.push(getComputedStyle(surface).transform);
    }
    return samples;
  }, state);
}

function observeNativeCloseAfterMotion(dialog: Locator) {
  return dialog.evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        const dialogElement = element as HTMLDialogElement;
        let closingAt: number | undefined;
        const observer = new MutationObserver(() => {
          if (closingAt === undefined && dialogElement.dataset.motionState === "closing") {
            closingAt = performance.now();
          }
          if (closingAt !== undefined && !dialogElement.hasAttribute("open")) {
            observer.disconnect();
            resolve(performance.now() - closingAt);
          }
        });
        observer.observe(dialogElement, {
          attributes: true,
          attributeFilter: ["data-motion-state", "open"],
        });
      }),
  );
}

test.describe(
  "Dialog / Implementation / Deep Sea Motion",
  {
    tag: ["@definition", "@dialog", "@implementation"],
    annotation: [
      componentImplementationAnnotation(dialogDefinition),
      componentImplementationRequirementsAnnotation(implementationRequirementIds),
    ],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1, name: "Network overview" })).toBeVisible();
    });

    async function DEEP_SEA_DIALOG_IMPLEMENTATION_01({ page }: { page: Page }) {
      await page.getByRole("button", { name: "Create report" }).click();
      const root = page.locator('[data-scope="dialog"][data-part="root"]');
      const dialog = page.getByRole("dialog", { name: "Create network report" });

      await expect(dialog).toBeVisible();
      await expect(root).toHaveCount(1);
      await expect(root.locator(':scope > [data-scope="dialog"][data-part="trigger"]')).toHaveCount(
        1,
      );
      await expect(root.locator(':scope > [data-scope="dialog"][data-part="surface"]')).toHaveCount(
        1,
      );
      await expect(dialog.locator("[data-motion-dialog-surface]")).toHaveCount(1);
    }

    test(
      "Keeps one presentational Motion surface inside the native dialog",
      {
        tag: ["@anatomy", `@${DEEP_SEA_DIALOG_IMPLEMENTATION_01.name}`],
      },
      DEEP_SEA_DIALOG_IMPLEMENTATION_01,
    );

    async function DEEP_SEA_DIALOG_IMPLEMENTATION_02({ page }: { page: Page }) {
      const trigger = page.getByRole("button", { name: "Create report" });
      await trigger.click();
      const namedDialog = page.getByRole("dialog", { name: "Create network report" });
      const nativeDialog = page.locator('dialog[data-scope="dialog"][data-part="surface"]');
      await expect(namedDialog).toBeVisible();
      await expect(namedDialog.locator("[data-motion-dialog-surface]")).toHaveCSS("opacity", "1");

      const closeDelay = observeNativeCloseAfterMotion(nativeDialog);
      await namedDialog.getByRole("button", { name: "Close" }).click();
      expect(await closeDelay).toBeGreaterThanOrEqual(150);
      await expect(nativeDialog).not.toBeVisible();
      await expect(nativeDialog).not.toHaveAttribute("open", "");
      await expect(trigger).toBeFocused();
    }

    test(
      "Completes surface exit before native close and restores trigger focus",
      {
        tag: ["@interaction", "@focus", `@${DEEP_SEA_DIALOG_IMPLEMENTATION_02.name}`],
      },
      DEEP_SEA_DIALOG_IMPLEMENTATION_02,
    );

    async function DEEP_SEA_DIALOG_IMPLEMENTATION_03({ page }: { page: Page }) {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      const trigger = page.getByRole("button", { name: "Create report" });
      const nativeDialog = page.locator('dialog[data-scope="dialog"][data-part="surface"]');
      const enterSamplesPromise = sampleSurfaceAfterState(nativeDialog, "open");
      await trigger.click();

      await expect(nativeDialog).toHaveAttribute("data-motion-policy", "animated");
      await expect(nativeDialog).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      const enterSamples = await enterSamplesPromise;
      expect(new Set(enterSamples).size).toBeGreaterThan(1);
      expect(enterSamples.some((transform) => transform.startsWith("matrix3d("))).toBe(true);

      const exitSamplesPromise = sampleSurfaceAfterState(nativeDialog, "closing");
      await page.getByRole("button", { name: "Close" }).click();
      const exitSamples = await exitSamplesPromise;
      expect(new Set(exitSamples).size).toBeGreaterThan(1);
    }

    test(
      "Runs visible surface motion when the Deep Sea preview explicitly forces it",
      {
        tag: ["@style", `@${DEEP_SEA_DIALOG_IMPLEMENTATION_03.name}`],
      },
      DEEP_SEA_DIALOG_IMPLEMENTATION_03,
    );
  },
);
