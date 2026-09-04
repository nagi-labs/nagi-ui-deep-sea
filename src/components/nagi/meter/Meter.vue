<!-- @nagi-source meter/Meter.vue@0.1.0 -->
<script setup lang="ts">
import { motion } from "motion-v";
import { computed, useAttrs, useId } from "vue";

import { mergeElementProps } from "@nagi-labs/nagi-ui";

defineOptions({ inheritAttrs: false });

const {
  label,
  id,
  value,
  min = 0,
  max = 1,
  low,
  high,
  optimum,
  motionActive = true,
} = defineProps<{
  label: string;
  id?: string;
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
  motionActive?: boolean;
}>();

const attrs = useAttrs();
const generatedId = useId();
const labelId = `${generatedId}-label`;
const normalizedValue = computed(() => {
  const range = max - min;
  if (range <= 0) return 0;
  return Math.min(1, Math.max(0, (value - min) / range));
});
const formattedValue = computed(() => `${Math.round(normalizedValue.value * 100)}%`);
const visualScale = computed(() => (motionActive ? normalizedValue.value : 0));
const meterTransition = {
  type: "spring" as const,
  stiffness: 210,
  damping: 28,
  mass: 0.8,
};
const meterProps = computed(() =>
  mergeElementProps({ "aria-labelledby": labelId }, attrs, {
    id: id ?? generatedId,
    value,
    min,
    max,
    low,
    high,
    optimum,
  }),
);
</script>

<template>
  <div
    class="n-meter"
    data-scope="meter"
    data-part="root"
  >
    <div class="unit -heading">
      <label
        :id="labelId"
        class="label"
        :for="id ?? generatedId"
        >{{ label }}</label
      >
      <span
        class="value"
        aria-hidden="true"
        >{{ formattedValue }}</span
      >
    </div>
    <div
      class="unit -gauge"
      data-part="track"
      aria-hidden="true"
    >
      <motion.span
        class="seg -fill"
        data-part="indicator"
        :initial="{ scaleX: 0 }"
        :animate="{ scaleX: visualScale }"
        :transition="meterTransition"
      />
    </div>
    <meter
      class="meter"
      data-part="control"
      v-bind="meterProps"
    >
      {{ value }} / {{ max }}
    </meter>
  </div>
</template>

<style scoped>
.n-meter {
  display: grid;
  gap: var(--n-space-3);
  color: var(--nagi-color-text);
  font: inherit;

  > .unit.-heading {
    display: flex;
    gap: var(--n-space-5);
    align-items: baseline;
    justify-content: space-between;

    > .label,
    > .value {
      font-size: var(--nagi-font-size-label);
    }

    > .label {
      color: var(--nagi-color-text-muted);
      font-weight: 650;
    }

    > .value {
      color: var(--nagi-color-text);
      font-variant-numeric: tabular-nums;
    }
  }

  > .unit.-gauge {
    block-size: 0.4rem;
    overflow: hidden;
    border-radius: var(--n-radius-3);
    background: var(--nagi-color-border-muted);

    > .seg.-fill {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      border-radius: inherit;
      background: var(--nagi-color-accent);
      transform-origin: left center;
    }
  }

  > .meter {
    position: fixed;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
