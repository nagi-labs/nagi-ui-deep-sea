// @deep-sea-source combobox/combobox.definition.ts@1
import {
  defineComponentDefinition,
  defineComponentImplementation,
} from "@nagi-labs/nagi-ui/definition";
import { comboboxContract } from "@nagi-labs/nagi-ui/contracts/combobox";

export const motionComboboxImplementation = defineComponentImplementation({
  id: "deep-sea/combobox-motion-popover",
  title: "Deep Sea Motion Combobox",
  version: "1",
  strategy: "platform-first-with-delegated-entry-motion",
  description:
    "Deep Sea keeps the native input, auto popover, and aria-activedescendant focus model while Motion presents popup entry and the provisional active indicator.",
  references: [
    {
      id: "motion-v-command-palette",
      title: "Motion for Vue — Command palette",
      url: "https://motion.dev/examples/vue-command-palette",
      kind: "example",
      revision: "public interaction and API summary reviewed 2026-09-03",
      reviewedAt: "2026-09-03",
    },
    {
      id: "motion-v-layout-animation",
      title: "Motion for Vue — Layout animation",
      url: "https://motion.dev/docs/vue-layout-animations",
      kind: "pattern",
      revision: "motion-v 2.4",
      reviewedAt: "2026-09-03",
    },
  ],
  decisions: [
    {
      name: "layer",
      value: "native-auto-popover",
      description:
        "The native auto popover remains the visibility, top-layer, and light-dismiss owner.",
      evidence: ["src/components/nagi/combobox/Combobox.vue", "tests/combobox.spec.ts"],
    },
    {
      name: "popup-motion",
      value: "motion-spring-entry-native-immediate-dismissal",
      description:
        "Motion animates the already-mounted popup from its closed visual state when the native popover opens; native dismissal is deliberately not delayed for exit presence.",
      evidence: ["src/components/nagi/combobox/Combobox.vue", "tests/combobox.spec.ts"],
    },
    {
      name: "active-indicator",
      value: "scoped-shared-layout-id",
      description:
        "One decorative indicator follows provisional activity by a Combobox-scoped layoutId without replacing aria-activedescendant.",
      evidence: ["src/components/nagi/combobox/Combobox.vue", "tests/combobox.spec.ts"],
    },
  ],
  anatomy: [
    {
      id: "DEEP_SEA_COMBOBOX_IMPLEMENTATION_01",
      evidence: ["tests/combobox.spec.ts"],
      name: "root",
      description: "The owned Combobox scope.",
      match: { by: "part", scope: "combobox", part: "root" },
    },
    {
      name: "input",
      description: "The native editable input and DOM focus owner.",
      match: { by: "part", scope: "combobox", part: "input" },
      within: "root",
      contractPart: "input",
    },
    {
      name: "popup",
      description: "The native auto popover that owns visibility and light dismissal.",
      match: { by: "part", scope: "combobox", part: "popup" },
      within: "root",
      contractPart: "popup",
    },
    {
      name: "motion-surface",
      description: "The presentational surface receiving Motion entry styles.",
      match: { by: "marker", attribute: "data-motion-combobox-surface" },
      within: "popup",
    },
    {
      name: "listbox",
      description: "The single-selection suggestion collection.",
      match: { by: "part", scope: "combobox", part: "listbox" },
      within: "motion-surface",
      contractPart: "listbox",
    },
    {
      name: "option",
      description: "A keyed suggestion that may become provisionally active.",
      match: { by: "part", scope: "combobox", part: "option" },
      within: "listbox",
      multiple: true,
      contractPart: "option",
    },
    {
      name: "active-indicator",
      description:
        "An optional decorative shared-layout indicator for the active suggestion.",
      match: { by: "marker", attribute: "data-motion-active-indicator" },
      within: "option",
      required: false,
    },
  ],
  interaction: [
    {
      id: "DEEP_SEA_COMBOBOX_IMPLEMENTATION_02",
      classification: "implementation-constraint",
      source: "Deep Sea native-popover Motion entry policy",
      text: "Opening suggestions runs a non-zero spring entry while DOM focus remains on the input; Escape retains native immediate dismissal.",
      evidence: ["tests/combobox.spec.ts"],
      origin: { kind: "nagi", policy: "deep-sea-combobox-popup-entry", policyVersion: "1" },
    },
  ],
  style: [
    {
      id: "DEEP_SEA_COMBOBOX_IMPLEMENTATION_03",
      classification: "implementation-constraint",
      source: "Deep Sea provisional active-indicator policy",
      text: "A spring layout indicator moves between enabled active suggestions while semantic activity remains expressed by aria-activedescendant and aria-selected.",
      evidence: ["tests/combobox.spec.ts"],
      origin: {
        kind: "nagi",
        policy: "deep-sea-combobox-active-indicator",
        policyVersion: "1",
      },
    },
  ],
});

export const comboboxDefinition = defineComponentDefinition({
  name: "Combobox",
  version: "3.0-deep-sea.1",
  status: "draft",
  contract: comboboxContract,
  implementation: motionComboboxImplementation,
});
