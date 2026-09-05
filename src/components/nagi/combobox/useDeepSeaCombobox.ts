// @deep-sea-source combobox/useDeepSeaCombobox.ts@1
import type { Ref } from "vue";

import { useCombobox } from "@nagi-labs/nagi-ui";

interface DeepSeaComboboxProps<Item> {
  readonly items: readonly Item[];
  readonly id?: string;
  readonly loading: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
  readonly validationMessage: string;
}

/** Adds Deep Sea Motion presentation to Nagi's complete Combobox behavior. */
export function useDeepSeaCombobox<Item extends { key: string; label: string; disabled?: boolean }>(
  props: DeepSeaComboboxProps<Item>,
  inputValue: Ref<string>,
  selected: Ref<string | null>,
) {
  const combobox = useCombobox(props, inputValue, selected);
  const popupVariants = {
    closed: { opacity: 0, y: -16, scale: 0.94, filter: "blur(10px)" },
    open: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  };
  const popupTransition = {
    type: "spring" as const,
    visualDuration: 0.42,
    bounce: 0.16,
  };
  const indicatorTransition = {
    type: "spring" as const,
    visualDuration: 0.34,
    bounce: 0.2,
  };

  return {
    ...combobox,
    indicatorTransition,
    popupTransition,
    popupVariants,
  };
}
