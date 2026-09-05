// @deep-sea-source toast/useDeepSeaToast.ts@1
import { nextTick, watch } from "vue";

import { useToast, type UseToastOptions } from "@nagi-labs/nagi-ui";

/** Adds retained Motion exit presence to Nagi's complete Toast behavior. */
export function useDeepSeaToast(options: UseToastOptions) {
  const toast = useToast(options);
  let exitPending = false;

  function showRegion() {
    const region = toast.regionElement.value;
    if (region?.isConnected && !region.matches(":popover-open")) region.showPopover();
  }

  watch(toast.toasts, async (items) => {
    if (items.length > 0) {
      exitPending = false;
      showRegion();
      return;
    }

    exitPending = true;
    await nextTick();
    if (exitPending) showRegion();
  });

  async function finishExit() {
    exitPending = false;
    await nextTick();
    const region = toast.regionElement.value;
    if (toast.toasts.value.length === 0 && region?.matches(":popover-open")) {
      region.hidePopover();
    }
  }

  return {
    ...toast,
    finishExit,
  };
}
