<!-- @nagi-source toast/Toast.vue@0.1.0 -->
<script setup lang="ts">
import { AnimatePresence, motion, useReducedMotion } from "motion-v";
import { computed, nextTick, ref, watch, type StyleValue } from "vue";

import { type ToastItem, type ToastManager } from "@nagi-labs/nagi-ui";
import { useToastRenderer } from "@nagi-labs/nagi-ui/component-controls";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    class?: string;
    style?: StyleValue;
    title?: string;
    manager?: ToastManager;
    duration?: number;
    limit?: number;
    label?: string;
    dismissLabel?: string;
    forceMotionPreview?: boolean;
  }>(),
  {
    duration: 4000,
    limit: 3,
    label: "Notifications",
    dismissLabel: "Dismiss notification",
    forceMotionPreview: false,
  },
);

const notifier = useToastRenderer(props);
const visibleToasts = computed(() => [...notifier.toasts.value].reverse());
const userPrefersReducedMotion = useReducedMotion();
const reduceMotion = computed(
  () => !props.forceMotionPreview && userPrefersReducedMotion.value,
);
const pointerInside = ref(false);
const focusInside = ref(false);
const expansionHeldDuringExit = ref(false);
const removalInProgress = ref(false);
const expanded = computed(
  () => pointerInside.value || focusInside.value || expansionHeldDuringExit.value,
);
const stackPadding = computed(() => {
  const hiddenItemCount = Math.max(visibleToasts.value.length - 1, 0);
  return hiddenItemCount * (expanded.value ? 92 : 12);
});
const itemTransition = computed(() =>
  reduceMotion.value
    ? { duration: 0 }
    : removalInProgress.value
      ? { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
      : { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
);
const exitTransition = computed(() =>
  reduceMotion.value ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
);
const stackTransition = computed(() =>
  reduceMotion.value
    ? { duration: 0 }
    : removalInProgress.value
      ? { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
      : { type: "spring" as const, visualDuration: 0.46, bounce: 0.08 },
);
let exitPending = false;

function itemState(index: number) {
  if (expanded.value) {
    return { opacity: 1, x: 0, y: index * -92, scale: 1 };
  }

  return {
    opacity: Math.max(0.68, 1 - index * 0.16),
    x: 0,
    y: index * -12,
    scale: Math.max(0.9, 1 - index * 0.04),
  };
}

function exitState() {
  return reduceMotion.value
    ? { opacity: 0, transition: exitTransition.value }
    : { opacity: 0, x: 72, scale: 0.96, transition: exitTransition.value };
}

function setPointerInside(value: boolean) {
  pointerInside.value = value;
}

function setFocusInside(value: boolean) {
  focusInside.value = value;
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget;
  const currentTarget = event.currentTarget as HTMLElement | null;
  if (!(nextTarget instanceof Node) || !currentTarget?.contains(nextTarget)) {
    setFocusInside(false);
  }
}

function showRegion() {
  const region = notifier.regionElement.value;
  if (region?.isConnected && !region.matches(":popover-open")) region.showPopover();
}

watch(notifier.toasts, async (items, previousItems) => {
  if (items.length < previousItems.length) removalInProgress.value = true;

  if (
    items.length < previousItems.length &&
    (pointerInside.value || focusInside.value)
  ) {
    expansionHeldDuringExit.value = true;
  }

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
  removalInProgress.value = false;
  expansionHeldDuringExit.value = false;
  const region = notifier.regionElement.value;
  if (notifier.toasts.value.length === 0 && region?.matches(":popover-open")) {
    region.hidePopover();
  }
}

function announcement(item: ToastItem) {
  return [item.title, item.description].filter(Boolean).join(". ");
}

function runAction(item: ToastItem) {
  return item.action?.onClick(item.id);
}

function dismiss(itemId: string) {
  expansionHeldDuringExit.value = expanded.value;
  notifier.close(itemId);
}

defineExpose({
  manager: notifier.manager,
  add: notifier.add,
  update: notifier.update,
  close: notifier.close,
  promise: notifier.promise,
  toast: notifier.toast,
  dismiss: notifier.dismiss,
});
</script>

<template>
  <div
    class="n-toast"
    :class="props.class"
    :style="props.style"
    :title="props.title"
  >
    <div class="unit -announcements">
      <p
        v-for="item in notifier.toasts.value"
        :key="`${item.id}-${item.revision}`"
        class="p"
        :role="item.priority === 'assertive' ? 'alert' : 'status'"
        aria-atomic="true"
      >
        {{ announcement(item) }}
      </p>
    </div>

    <div
      class="unit"
      v-bind="notifier.regionProps"
    >
      <motion.ol
        class="list"
        data-motion-toast-stack
        :data-expanded="expanded ? '' : undefined"
        :data-motion-policy="reduceMotion ? 'reduced' : 'animated'"
        :animate="{ paddingTop: stackPadding }"
        :transition="stackTransition"
        @pointerenter="setPointerInside(true)"
        @pointerleave="setPointerInside(false)"
        @focusin="setFocusInside(true)"
        @focusout="handleFocusOut"
      >
        <AnimatePresence
          mode="sync"
          :initial="false"
          @exit-complete="finishExit"
        >
          <motion.li
            v-for="(item, index) in visibleToasts"
            :key="item.id"
            class="item"
            :data-tone="item.tone"
            data-motion-toast-item
            :style="{ zIndex: visibleToasts.length - index }"
            :initial="reduceMotion ? false : { opacity: 0, x: 72, y: 18, scale: 0.92 }"
            :animate="itemState(index)"
            :exit="exitState()"
            :transition="itemTransition"
            v-bind="notifier.toastItemProps(item)"
          >
            <strong
              v-if="item.title"
              class="strong"
            >
              {{ item.title }}
            </strong>
            <p
              v-if="item.description"
              class="p"
            >
              {{ item.description }}
            </p>
            <div class="actions">
              <button
                v-if="item.action"
                class="button -action"
                type="button"
                @click="runAction(item)"
              >
                {{ item.action.label }}
              </button>
              <button
                class="button -dismiss"
                type="button"
                :aria-label="dismissLabel"
                @click="dismiss(item.id)"
              >
                ×
              </button>
            </div>
          </motion.li>
        </AnimatePresence>
      </motion.ol>
    </div>
  </div>
</template>

<style scoped>
.n-toast {
  display: contents;

  > .unit.-announcements {
    position: fixed;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;

    > .p {
      margin: 0;
    }
  }

  > .unit {
    position: fixed;
    inset: auto 1rem 1rem auto;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;

    > .list {
      display: grid;
      align-items: end;
      min-inline-size: min(22rem, calc(100vi - 2rem));
      margin: 0;
      padding: 0;
      list-style: none;
      perspective: 60rem;

      > .item {
        grid-area: 1 / 1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: var(--nagi-space-item-gap);
        align-items: center;
        padding: var(--n-space-6) var(--n-space-7);
        border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
        border-radius: var(--nagi-radius-overlay);
        background: var(--nagi-color-surface);
        color: var(--nagi-color-text);
        box-shadow: var(--nagi-shadow-overlay);
        transform-origin: 50% 100%;
        will-change: transform, opacity;

        > .strong {
          grid-column: 1;
          min-inline-size: 0;
          margin: 0 0 var(--n-space-1);
          font-weight: 750;
        }

        > .p {
          grid-column: 1;
          min-inline-size: 0;
          margin: 0;
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-3);
        }

        > .actions {
          grid-column: 2;
          grid-row: 1 / span 2;
          display: flex;
          gap: var(--n-space-2);
          align-items: center;

          > .button {
            min-block-size: 1.75rem;
            padding-inline: var(--n-space-4);
            border: 0;
            border-radius: var(--nagi-radius-item);
            background: transparent;
            color: inherit;
            font: inherit;
            cursor: pointer;

            &:hover {
              background: color-mix(in srgb, currentColor 8%, transparent);
            }

            &:focus-visible {
              outline: 2px solid var(--nagi-color-focus-ring);
              outline-offset: var(--n-border-width-1);
            }

            &.-action {
              color: var(--nagi-color-accent);
              font-weight: 700;
            }

            &.-dismiss {
              inline-size: 1.75rem;
              padding: 0;
              font-size: var(--n-font-size-5);
            }
          }
        }

        &[data-tone="accent"] {
          border-color: var(--nagi-color-accent);
          background: var(--nagi-color-surface-accent);
        }

        &[data-tone="success"] {
          border-color: var(--nagi-color-success);
          background: var(--nagi-color-surface-success);
        }

        &[data-tone="warning"] {
          border-color: var(--nagi-color-warning);
          background: var(--nagi-color-surface-warning);
        }

        &[data-tone="danger"] {
          border-color: var(--nagi-color-danger);
          background: var(--nagi-color-surface-danger);
        }
      }
    }
  }
}
</style>
