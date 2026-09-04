// @nagi-source toast/useToastMotion.ts@0.1.0
import { computed, nextTick, watch, type Ref } from "vue";

import type { ToastItem } from "@nagi-labs/nagi-ui";

interface UseToastMotionOptions {
  regionElement: Readonly<Ref<HTMLElement | null>>;
  toasts: Readonly<Ref<readonly ToastItem[]>>;
}

/** Keeps the native popover present until Motion has released its final exiting item. */
export function useToastMotion(options: UseToastMotionOptions) {
  const visibleToasts = computed(() => [...options.toasts.value].reverse());
  let exitPending = false;

  function showRegion() {
    const region = options.regionElement.value;
    if (region?.isConnected && !region.matches(":popover-open")) region.showPopover();
  }

  watch(options.toasts, async (items) => {
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
    const region = options.regionElement.value;
    if (options.toasts.value.length === 0 && region?.matches(":popover-open")) {
      region.hidePopover();
    }
  }

  return {
    finishExit,
    visibleToasts,
  };
}
