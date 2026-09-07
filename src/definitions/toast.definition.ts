import {
  defineComponentDefinition,
  defineComponentImplementation,
} from "@nagi-labs/nagi-ui/definition";
import { toastContract } from "@nagi-labs/nagi-ui/contracts/toast";

export const motionToastImplementation = defineComponentImplementation({
  id: "deep-sea/toast-motion-stack",
  title: "Deep Sea Motion Toast list",
  version: "1",
  strategy: "platform-first-with-delegated-presence",
  description:
    "Deep Sea retains Nagi's explicit manager, native manual-popover layer, announcements, and focus routing while Motion owns keyed item presence and vertical reflow.",
  references: [
    {
      id: "motion-v-animate-presence-modes",
      title: "Motion for Vue — AnimatePresence modes",
      url: "https://motion.dev/examples/vue-animate-presence-modes",
      kind: "example",
      revision: "reviewed 2026-09-04",
      reviewedAt: "2026-09-04",
    },
    {
      id: "motion-v-animate-presence",
      title: "Motion for Vue — AnimatePresence",
      url: "https://motion.dev/docs/vue-animate-presence",
      kind: "example",
      revision: "motion-v 2.4",
      reviewedAt: "2026-09-03",
    },
  ],
  decisions: [
    {
      name: "layer",
      value: "native-manual-popover",
      description:
        "The Nagi renderer continues to own top-layer promotion and F6 routing through one native manual popover.",
      evidence: [
        "src/components/nagi/toast/Toast.vue",
        "src/components/nagi/toast/useDeepSeaToast.ts",
        "tests/toast.spec.ts",
      ],
    },
    {
      name: "presence",
      value: "motion-animate-presence-items",
      description:
        "AnimatePresence retains removed notification DOM only for its visual exit; manager state remains authoritative.",
      evidence: [
        "src/components/nagi/toast/Toast.vue",
        "src/components/nagi/toast/useDeepSeaToast.ts",
        "tests/toast.spec.ts",
      ],
    },
    {
      name: "layout",
      value: "keyed-vertical-layout-list",
      description:
        "Each notification is a keyed layout item; popLayout removes exiting items from flow while the remaining items reflow.",
      evidence: [
        "src/components/nagi/toast/Toast.vue",
        "src/components/nagi/toast/useDeepSeaToast.ts",
        "tests/toast.spec.ts",
      ],
    },
  ],
  anatomy: [
    {
      id: "DEEP_SEA_TOAST_IMPLEMENTATION_01",
      evidence: ["tests/toast.spec.ts"],
      name: "motion-stack",
      description: "The positioned visual list that coordinates keyed layout changes.",
      match: { by: "marker", attribute: "data-motion-toast-stack" },
    },
    {
      name: "motion-item",
      description: "A keyed notification whose presence and stack position are animated.",
      match: { by: "marker", attribute: "data-motion-toast-item" },
      within: "motion-stack",
      multiple: true,
    },
  ],
  interaction: [
    {
      id: "DEEP_SEA_TOAST_IMPLEMENTATION_02",
      classification: "implementation-constraint",
      source: "Deep Sea retained-exit focus policy",
      text: "Removing the focused notification hands focus to a live notification action or the external origin before retained exit DOM becomes inert.",
      evidence: ["tests/toast.spec.ts"],
      origin: { kind: "nagi", policy: "deep-sea-toast-exit-focus", policyVersion: "1" },
    },
  ],
  style: [
    {
      id: "DEEP_SEA_TOAST_IMPLEMENTATION_03",
      classification: "implementation-constraint",
      source: "Deep Sea notification stack motion",
      text: "Insertion, keyed vertical reflow, and removal use non-zero Motion transitions in the explicitly forced verification profile.",
      evidence: ["tests/toast.spec.ts"],
      origin: { kind: "nagi", policy: "deep-sea-toast-motion-stack", policyVersion: "1" },
    },
  ],
});

export const toastDefinition = defineComponentDefinition({
  name: "Toast",
  version: "1.0-deep-sea.1",
  status: "verified",
  contract: toastContract,
  implementation: motionToastImplementation,
});
