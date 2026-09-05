// @deep-sea-source button/useDeepSeaButton.ts@1
import { reactive } from "vue";

import { mergeElementProps, withoutClassToken } from "@nagi-labs/nagi-ui";

interface DeepSeaButtonProps {
  readonly type: "button" | "submit" | "reset";
  readonly disabled: boolean;
  readonly focusableWhenDisabled: boolean;
}

/** Connects the owned Button's complete native-root binding. */
export function useDeepSeaButton(
  props: DeepSeaButtonProps,
  attrs: Readonly<Record<string, unknown>>,
) {
  const focusableDisabled = () => props.disabled && props.focusableWhenDisabled;

  function suppressFocusableDisabledActivation(event: MouseEvent) {
    if (!focusableDisabled()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  const behaviorProps = reactive({
    get disabled() {
      return props.disabled && !props.focusableWhenDisabled;
    },
    get "aria-disabled"() {
      return focusableDisabled() ? ("true" as const) : undefined;
    },
    onClickCapture: suppressFocusableDisabledActivation,
  });

  return reactive({
    get buttonProps() {
      return mergeElementProps(
        behaviorProps,
        { ...attrs, class: withoutClassToken(attrs.class, "n-button") },
        { type: props.type },
      );
    },
  });
}
