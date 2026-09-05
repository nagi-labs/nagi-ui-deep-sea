// @deep-sea-source meter/useDeepSeaMeter.ts@1
import { computed, useId } from "vue";

import { mergeElementProps } from "@nagi-labs/nagi-ui";

interface DeepSeaMeterProps {
  readonly id?: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly low?: number;
  readonly high?: number;
  readonly optimum?: number;
  readonly motionActive: boolean;
}

/** Derives the owned Meter's native binding, display value, and Motion state. */
export function useDeepSeaMeter(
  props: DeepSeaMeterProps,
  attrs: Readonly<Record<string, unknown>>,
) {
  const generatedId = useId();
  const controlId = computed(() => props.id ?? generatedId);
  const labelId = `${generatedId}-label`;
  const normalizedValue = computed(() => {
    const range = props.max - props.min;
    if (range <= 0) return 0;
    return Math.min(1, Math.max(0, (props.value - props.min) / range));
  });
  const formattedValue = computed(() => `${Math.round(normalizedValue.value * 100)}%`);
  const visualScale = computed(() => (props.motionActive ? normalizedValue.value : 0));
  const transition = {
    type: "spring" as const,
    stiffness: 210,
    damping: 28,
    mass: 0.8,
  };
  return {
    controlId,
    formattedValue,
    labelId,
    get meterProps() {
      return mergeElementProps({ "aria-labelledby": labelId }, attrs, {
        id: controlId.value,
        value: props.value,
        min: props.min,
        max: props.max,
        low: props.low,
        high: props.high,
        optimum: props.optimum,
      });
    },
    transition,
    visualScale,
  };
}
