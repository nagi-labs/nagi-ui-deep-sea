<!-- @deep-sea-source meter/Meter.vue@1 -->
<script setup lang="ts">
import { motion } from "motion-v";
import { useAttrs } from "vue";

import { useDeepSeaMeter } from "./useDeepSeaMeter";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  label: string;
  id?: string;
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
  motionActive?: boolean;
}>(), {
  min: 0,
  max: 1,
  motionActive: true,
});

const meter = useDeepSeaMeter(props, useAttrs());
</script>

<template>
  <div
    class="n-meter"
    data-scope="meter"
    data-part="root"
  >
    <div class="unit -heading">
      <label
        :id="meter.labelId"
        class="label"
        :for="meter.controlId.value"
        >{{ props.label }}</label
      >
      <span
        class="value"
        aria-hidden="true"
        >{{ meter.formattedValue.value }}</span
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
        :animate="{ scaleX: meter.visualScale.value }"
        :transition="meter.transition"
      />
    </div>
    <meter
      class="meter"
      data-part="control"
      v-bind="meter.meterProps"
    >
      {{ props.value }} / {{ props.max }}
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
