// @deep-sea-source dialog/dialog.definition.ts@1
import {
  adoptRequirementSet,
  defineComponentDefinition,
  defineComponentImplementation,
} from "@nagi-labs/nagi-ui/definition";
import {
  dialogComponentContract,
  nagiDialogRequirementsV2,
} from "@nagi-labs/nagi-ui/contracts/dialog";

const nativeDialog = adoptRequirementSet(nagiDialogRequirementsV2, {
  prefix: "DLG",
  profile: {
    role: "dialog",
    modality: "modal-only",
    description: "optional-simple",
    dismissal: "light-dismiss-any",
  },
  evidence: {
    "SEM-01": [
      "packages/core/src/test/dialog-contract.ts",
      "tests/browser/definition-mutations.spec.ts",
    ],
    "SEM-02": ["packages/core/src/test/dialog-contract.ts"],
    "SEM-03": ["packages/core/src/test/dialog-contract.ts", "tests/dialog.test.ts"],
    "STATE-01": ["packages/core/src/test/dialog-contract.ts", "tests/dialog.test.ts"],
    "STATE-02": [
      "packages/core/src/test/dialog-contract.ts",
      "tests/dialog.test.ts",
      "tests/browser/definition-mutations.spec.ts",
    ],
    "INT-01": ["packages/core/src/test/dialog-contract.ts", "tests/dialog.test.ts"],
    "FOCUS-01": ["packages/core/src/test/dialog-contract.ts"],
    "FOCUS-02": [
      "packages/core/src/test/dialog-contract.ts",
      "tests/browser/definition-mutations.spec.ts",
      "tests/browser/shadow-root.spec.ts",
    ],
  },
});

export const motionDialogImplementation = defineComponentImplementation({
  id: "deep-sea/dialog-motion",
  title: "Deep Sea Motion Dialog",
  version: "1",
  strategy: "platform-first-with-delegated-presence",
  description:
    "Deep Sea retains the native dialog lifecycle while delegating the visual surface presence to Motion.",
  adopts: [nativeDialog],
  references: [
    {
      id: "motion-v-modal-dialog",
      title: "Motion for Vue — Modal dialog",
      url: "https://motion.dev/examples/vue-modal",
      kind: "example",
      revision: "reviewed 2026-09-03",
      reviewedAt: "2026-09-03",
    },
    {
      id: "motion-v-animate-presence",
      title: "Motion for Vue — AnimatePresence",
      url: "https://motion.dev/docs/vue-animate-presence",
      kind: "example",
      revision: "motion-v 2.4",
      reviewedAt: "2026-09-03",
    },
    {
      id: "motion-3d-transforms-modal",
      title: "Motion — 3D transforms modal guidance",
      url: "https://motion.dev/docs/3d-transforms",
      kind: "pattern",
      revision: "reviewed 2026-09-03",
      reviewedAt: "2026-09-03",
    },
    {
      id: "motion-v-radix-dialog",
      title: "Motion for Vue — Radix Dialog 3D state values",
      url: "https://motion.dev/examples/vue-radix-dialog",
      kind: "example",
      revision: "reviewed 2026-09-03",
      reviewedAt: "2026-09-03",
    },
  ],
  decisions: [
    {
      name: "element",
      value: "native-dialog",
      description:
        "The native dialog remains the top-layer, modality, focus, and close-event owner.",
      evidence: [
        "src/components/nagi/dialog/Dialog.vue",
        "src/components/nagi/dialog/useDeepSeaDialog.ts",
        "tests/dialog.spec.ts",
      ],
    },
    {
      name: "presence",
      value: "animate-presence-surface-inside-held-native-dialog",
      description:
        "AnimatePresence enters and removes the Motion surface while the native dialog remains mounted until exit completes.",
      evidence: [
        "src/components/nagi/dialog/Dialog.vue",
        "src/components/nagi/dialog/useDeepSeaDialog.ts",
        "tests/dialog.spec.ts",
      ],
    },
    {
      name: "reduced-motion",
      value: "user-default-with-explicit-preview",
      description:
        "Reduced motion removes spatial duration by default; the Deep Sea showcase may explicitly force the preview.",
      evidence: [
        "src/components/nagi/dialog/Dialog.vue",
        "src/components/nagi/dialog/useDeepSeaDialog.ts",
        "tests/dialog.spec.ts",
      ],
    },
  ],
  anatomy: [
    {
      id: "DEEP_SEA_DIALOG_IMPLEMENTATION_01",
      evidence: ["tests/dialog.spec.ts"],
      name: "motion-surface",
      description:
        "The presentational surface animated inside the native dialog without taking over dialog semantics.",
      match: { by: "marker", attribute: "data-motion-dialog-surface" },
      within: "surface",
    },
  ],
  interaction: [
    {
      id: "DEEP_SEA_DIALOG_IMPLEMENTATION_02",
      classification: "implementation-constraint",
      source: "Deep Sea held native-dialog presence policy",
      text: "A close request keeps the native dialog open and modal until the Motion surface exit completes, then performs the native close so trigger focus restoration remains browser-owned.",
      evidence: ["tests/dialog.spec.ts"],
      origin: { kind: "nagi", policy: "deep-sea-dialog-presence", policyVersion: "1" },
    },
  ],
  style: [
    {
      id: "DEEP_SEA_DIALOG_IMPLEMENTATION_03",
      classification: "implementation-constraint",
      source: "Deep Sea dialog motion policy",
      text: "The Deep Sea showcase explicitly forces the official Motion modal pattern's perspective, z-depth, rotateX, rotateY, opacity, and blur transition even when the browser requests reduced motion.",
      evidence: ["tests/dialog.spec.ts"],
      origin: {
        kind: "nagi",
        policy: "deep-sea-dialog-reduced-motion",
        policyVersion: "1",
      },
    },
  ],
});

/** Observable guarantees resolved for Deep Sea's native-dialog Motion implementation. */
export const dialogDefinition = defineComponentDefinition({
  name: "Dialog",
  version: "3.0-deep-sea.1",
  status: "verified",
  contract: dialogComponentContract,
  implementation: motionDialogImplementation,
});
