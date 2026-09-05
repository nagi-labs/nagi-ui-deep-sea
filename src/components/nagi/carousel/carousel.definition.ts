// @deep-sea-source carousel/carousel.definition.ts@1
import {
  defineComponentDefinition,
  defineComponentImplementation,
} from "@nagi-labs/nagi-ui/definition";
import { carouselContract } from "@nagi-labs/nagi-ui/contracts/carousel";

export const motionCarouselImplementation = defineComponentImplementation({
  id: "deep-sea/carousel-motion",
  title: "Deep Sea Motion Carousel",
  version: "1",
  strategy: "delegated",
  description:
    "Deep Sea realizes the shared Carousel Contract with keyed Motion presence instead of a native scroll viewport.",
  references: [
    {
      id: "motion-v-animate-presence",
      title: "Motion for Vue — AnimatePresence",
      url: "https://motion.dev/docs/vue-animate-presence",
      kind: "example",
      revision: "motion-v 2.4",
      reviewedAt: "2026-09-02",
    },
  ],
  decisions: [
    {
      name: "layout",
      value: "single-presented-slide",
      description: "Mount the accepted slide rather than exposing a scroll viewport.",
      evidence: [
        "src/components/nagi/carousel/Carousel.vue",
        "src/components/nagi/carousel/useDeepSeaCarousel.ts",
        "tests/carousel-contract.spec.ts",
      ],
    },
    {
      name: "presence",
      value: "motion-animate-presence",
      description:
        "Overlap horizontal exit and enter by the stable item key and navigation direction.",
      evidence: [
        "src/components/nagi/carousel/Carousel.vue",
        "src/components/nagi/carousel/useDeepSeaCarousel.ts",
        "tests/carousel-contract.spec.ts",
      ],
    },
    {
      name: "reduced-motion",
      value: "user-default-with-explicit-preview",
      description:
        "Honor the user's reduced-motion preference by default; the dedicated visual-review surface may explicitly force a Motion preview.",
      evidence: [
        "src/components/nagi/carousel/Carousel.vue",
        "src/components/nagi/carousel/useDeepSeaCarousel.ts",
        "tests/carousel-contract.spec.ts",
        "tests/app.spec.ts",
      ],
    },
  ],
  anatomy: [
    {
      name: "root",
      description: "The rendered Carousel ownership root.",
      match: { by: "part", scope: "carousel", part: "root" },
      contractPart: "carousel",
    },
    {
      id: "DEEP_SEA_CAROUSEL_IMPLEMENTATION_01",
      evidence: ["tests/carousel-contract.spec.ts"],
      name: "slide",
      description: "The currently presented, keyed Motion slide.",
      match: { by: "part", scope: "carousel", part: "slide" },
      within: "root",
      multiple: true,
      outermost: true,
      contractPart: "slide",
    },
  ],
  interaction: [
    {
      id: "DEEP_SEA_CAROUSEL_IMPLEMENTATION_02",
      classification: "implementation-constraint",
      source: "Deep Sea keyed presence policy",
      text: "Changing the accepted index moves the keyed outgoing and incoming slides concurrently in opposite directions along the horizontal axis; no native scroll position participates in state.",
      evidence: ["tests/carousel-contract.spec.ts"],
      origin: { kind: "nagi", policy: "deep-sea-carousel-presence", policyVersion: "1" },
    },
  ],
  style: [
    {
      id: "DEEP_SEA_CAROUSEL_IMPLEMENTATION_03",
      classification: "implementation-constraint",
      source: "Deep Sea reduced-motion policy",
      text: "When the resolved component policy honors a reduced-motion request, replacing the accepted slide has zero duration and no spatial movement.",
      evidence: ["tests/carousel-contract.spec.ts"],
      origin: { kind: "nagi", policy: "deep-sea-carousel-reduced-motion", policyVersion: "1" },
    },
  ],
});

export const carouselDefinition = defineComponentDefinition({
  name: "Carousel",
  version: "1.0",
  status: "draft",
  contract: carouselContract,
  implementation: motionCarouselImplementation,
});
