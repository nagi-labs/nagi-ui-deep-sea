import { expect, test, type Page } from "@playwright/test";

import {
  carouselContract,
  componentImplementationAnnotation,
  componentImplementationRequirementsAnnotation,
  inspectAnatomy,
} from "@nagi-labs/nagi-ui/test";
import { carouselDefinition } from "../src/components/nagi/carousel/carousel.definition";

const slides = [
  { label: "Abyssal relay", position: "1 / 3" },
  { label: "Pelagic array", position: "2 / 3" },
  { label: "Hadal station", position: "3 / 3" },
] as const;

interface MotionCall {
  text: string;
  keyframes: string;
  startedAt: number;
  duration: number;
}

async function captureSlideMotion(page: Page) {
  await page.evaluate(() => {
    const captureWindow = window as Window & { __deepSeaMotionCalls?: MotionCall[] };
    const nativeAnimate = Element.prototype.animate;
    captureWindow.__deepSeaMotionCalls = [];
    Element.prototype.animate = function captureMotionCall(keyframes, options) {
      const startedAt = performance.now();
      const animation = nativeAnimate.call(this, keyframes, options);
      if (this.matches("[data-motion-slide]")) {
        captureWindow.__deepSeaMotionCalls?.push({
          text: this.textContent ?? "",
          keyframes: JSON.stringify(keyframes),
          startedAt,
          duration: Number(animation.effect?.getTiming().duration ?? 0),
        });
      }
      return animation;
    };
  });
}

function readSlideMotion(page: Page) {
  return page.evaluate(
    () => (window as Window & { __deepSeaMotionCalls?: MotionCall[] }).__deepSeaMotionCalls ?? [],
  );
}

carouselContract({
  definition: carouselDefinition,
  includeStandardImplementation: false,
  url: "/carousel-contract",
  name: "Deep Sea release highlights",
  slides,
  rootRole: "region",
  modelStatusName: "Deep Sea carousel model",
  secondAnnouncement: "2 / 3",
  externalUpdateName: "Set Deep Sea carousel to third",
  expectedExternalIndex: "2",
  looped: {
    name: "Deep Sea looped highlights",
    modelStatusName: "Deep Sea looped carousel model",
  },
  rejected: {
    name: "Deep Sea locked highlights",
    modelStatusName: "Deep Sea locked carousel model",
    requestStatusName: "Deep Sea locked carousel requests",
  },
  outOfRange: {
    name: "Deep Sea bounded highlights",
    modelStatusName: "Deep Sea bounded carousel model",
    sourceIndex: "99",
    acceptedIndex: 2,
  },
  disabled: {
    name: "Deep Sea disabled highlights",
    modelStatusName: "Deep Sea disabled carousel model",
    externalUpdateName: "Set Deep Sea disabled carousel to second",
    expectedExternalIndex: "1",
  },
});

const implementationRequirementIds = [
  "DEEP_SEA_CAROUSEL_IMPLEMENTATION_01",
  "DEEP_SEA_CAROUSEL_IMPLEMENTATION_02",
  "DEEP_SEA_CAROUSEL_IMPLEMENTATION_03",
] as const;

test.describe(
  "Carousel / Implementation / Deep Sea Motion",
  {
    tag: ["@definition", "@carousel", "@implementation"],
    annotation: [
      componentImplementationAnnotation(carouselDefinition),
      componentImplementationRequirementsAnnotation(implementationRequirementIds),
    ],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/carousel-contract");
    });

    async function DEEP_SEA_CAROUSEL_IMPLEMENTATION_01({ page }: { page: Page }) {
      const root = page.getByRole("region", {
        name: "Deep Sea release highlights",
        exact: true,
      });
      expect(await root.evaluate(inspectAnatomy, carouselDefinition.anatomy)).toEqual([]);
      await expect(root.locator('[data-part="viewport"]')).toHaveCount(0);
      await expect(root.locator('[data-motion-slide][data-part="slide"]')).toHaveCount(1);
    }

    test(
      "Mounts the accepted slide without inheriting the native-scroll viewport",
      {
        tag: ["@anatomy", `@${DEEP_SEA_CAROUSEL_IMPLEMENTATION_01.name}`],
      },
      DEEP_SEA_CAROUSEL_IMPLEMENTATION_01,
    );

    async function DEEP_SEA_CAROUSEL_IMPLEMENTATION_02({ page }: { page: Page }) {
      const frameBoundaryTolerance = 20;
      await captureSlideMotion(page);
      const root = page.getByRole("region", {
        name: "Deep Sea release highlights",
        exact: true,
      });
      const first = root.getByRole("group", { name: /Abyssal relay.*1 \/ 3/u });
      await root.getByRole("button", { name: "Next slide" }).click();
      const second = root.getByRole("group", { name: /Pelagic array.*2 \/ 3/u });
      await expect(second).toBeVisible();
      await expect(first).toHaveCount(0);
      await expect
        .poll(async () =>
          (await readSlideMotion(page)).some(
            (call) =>
              call.text.includes("Pelagic array") &&
              call.keyframes.includes('"transform":["translateX(64px)'),
          ),
        )
        .toBe(true);
      const forwardCalls = await readSlideMotion(page);
      const forwardExit = forwardCalls.find(
        (call) =>
          call.text.includes("Abyssal relay") &&
          call.keyframes.includes('"transform":["translateX(0) scale(1)","translateX(-64px)'),
      );
      const forwardEnter = forwardCalls.find(
        (call) =>
          call.text.includes("Pelagic array") &&
          call.keyframes.includes('"transform":["translateX(64px)'),
      );
      expect(forwardExit).toBeDefined();
      expect(forwardEnter).toBeDefined();
      expect(forwardExit!.duration).toBeGreaterThan(frameBoundaryTolerance);
      expect(forwardEnter!.duration).toBeGreaterThan(frameBoundaryTolerance);
      expect(Math.abs(forwardEnter!.startedAt - forwardExit!.startedAt)).toBeLessThan(
        frameBoundaryTolerance,
      );

      await expect
        .poll(() =>
          second.evaluate(
            (element) =>
              element.getAnimations().filter((animation) => animation.playState === "running")
                .length,
          ),
        )
        .toBe(0);

      await root.getByRole("button", { name: "Previous slide" }).click();
      const returningFirst = root.getByRole("group", { name: /Abyssal relay.*1 \/ 3/u });
      await expect(returningFirst).toBeVisible();
      await expect(second).toHaveCount(0);
      await expect
        .poll(async () =>
          (await readSlideMotion(page)).some(
            (call) =>
              call.text.includes("Abyssal relay") &&
              call.keyframes.includes('"transform":["translateX(-64px)'),
          ),
        )
        .toBe(true);
      const reverseCalls = await readSlideMotion(page);
      const reverseExit = reverseCalls.find(
        (call) =>
          call.text.includes("Pelagic array") &&
          call.keyframes.includes('"transform":["translateX(0) scale(1)","translateX(64px)'),
      );
      const reverseEnter = reverseCalls.find(
        (call) =>
          call.text.includes("Abyssal relay") &&
          call.keyframes.includes('"transform":["translateX(-64px)'),
      );
      expect(reverseExit).toBeDefined();
      expect(reverseEnter).toBeDefined();
      expect(reverseExit!.duration).toBeGreaterThan(frameBoundaryTolerance);
      expect(reverseEnter!.duration).toBeGreaterThan(frameBoundaryTolerance);
      expect(Math.abs(reverseEnter!.startedAt - reverseExit!.startedAt)).toBeLessThan(
        frameBoundaryTolerance,
      );
    }

    test(
      "Overlaps directional horizontal exit and enter motion",
      {
        tag: ["@interaction", `@${DEEP_SEA_CAROUSEL_IMPLEMENTATION_02.name}`],
      },
      DEEP_SEA_CAROUSEL_IMPLEMENTATION_02,
    );

    async function DEEP_SEA_CAROUSEL_IMPLEMENTATION_03({ page }: { page: Page }) {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await captureSlideMotion(page);
      const root = page.getByRole("region", {
        name: "Deep Sea release highlights",
        exact: true,
      });
      await expect(root.locator('[data-motion-policy="reduced"]')).toHaveCount(1);
      await root.getByRole("button", { name: "Next slide" }).click();
      const second = root.getByRole("group", { name: /Pelagic array.*2 \/ 3/u });
      await expect(second).toBeVisible();
      expect(
        await second.evaluate(
          (element) =>
            element.getAnimations().filter((animation) => animation.playState === "running").length,
        ),
      ).toBe(0);
      const reducedMotionCalls = await readSlideMotion(page);
      expect(reducedMotionCalls.every((call) => call.duration === 0)).toBe(true);
      expect(
        reducedMotionCalls.every((call) => !/translate[XY]\((?!0(?:px)?\))/u.test(call.keyframes)),
      ).toBe(true);
    }

    test(
      "Removes spatial transition activity when reduced motion is requested",
      {
        tag: ["@style", `@${DEEP_SEA_CAROUSEL_IMPLEMENTATION_03.name}`],
      },
      DEEP_SEA_CAROUSEL_IMPLEMENTATION_03,
    );
  },
);
