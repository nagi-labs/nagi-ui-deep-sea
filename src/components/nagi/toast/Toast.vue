<!-- @deep-sea-source toast/Toast.vue@1 -->
<script setup lang="ts">
import { AnimatePresence, motion, MotionConfig } from "motion-v";
import type { StyleValue } from "vue";

import { type ToastManager } from "@nagi-labs/nagi-ui";
import { useDeepSeaToast } from "./useDeepSeaToast";

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
const notifier = useDeepSeaToast(props);
const toastTransition = {
  type: "spring" as const,
  visualDuration: 0.36,
  bounce: 0.08,
};
const toastInitial = { opacity: 0, x: 48, scale: 0.96 };
const toastVisible = { opacity: 1, x: 0, scale: 1 };
const toastExit = { opacity: 0, x: 48, scale: 0.96 };

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
      <span
        v-for="item in notifier.toasts.value"
        :key="`${item.id}-${item.revision}`"
        class="text"
        :role="item.priority === 'assertive' ? 'alert' : 'status'"
        aria-atomic="true"
      >
        {{ notifier.announcementText(item) }}
      </span>
    </div>

    <div
      class="unit -stack"
      v-bind="notifier.regionProps"
    >
      <motion-config :reduced-motion="forceMotionPreview ? 'never' : 'user'">
        <motion.ol
          class="list"
          data-motion-toast-stack
          :data-motion-policy="forceMotionPreview ? 'animated' : 'user'"
          layout
          :transition="toastTransition"
        >
          <AnimatePresence
            mode="popLayout"
            :initial="false"
            @exit-complete="notifier.finishExit"
          >
            <motion.li
              v-for="item in notifier.visibleToasts.value"
              :key="item.id"
              class="item"
              :data-tone="item.tone"
              data-motion-toast-item
              layout
              :initial="toastInitial"
              :animate="toastVisible"
              :exit="toastExit"
              :transition="toastTransition"
              v-bind="notifier.toastItemProps(item)"
            >
              <strong
                v-if="item.title"
                class="strong"
              >
                {{ item.title }}
              </strong>
              <span
                v-if="item.description"
                class="text"
              >
                {{ item.description }}
              </span>
              <div class="actions">
                <button
                  v-if="item.action"
                  v-bind="notifier.actionProps(item)"
                  class="button -action"
                  type="button"
                >
                  {{ item.action.label }}
                </button>
                <button
                  class="button -dismiss"
                  type="button"
                  :aria-label="dismissLabel"
                  @click="notifier.close(item.id)"
                >
                  ×
                </button>
              </div>
            </motion.li>
          </AnimatePresence>
        </motion.ol>
      </motion-config>
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
  }

  > .unit.-stack {
    position: fixed;
    inset: auto 1rem 1rem auto;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;

    > .list {
      position: relative;
      display: grid;
      gap: var(--nagi-space-item-gap);
      align-items: end;
      min-inline-size: min(22rem, calc(100vi - 2rem));
      margin: 0;
      padding: 0;
      list-style: none;

      > .item {
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
        will-change: transform, opacity;

        > .strong {
          grid-column: 1;
          min-inline-size: 0;
          margin: 0 0 var(--n-space-1);
          font-weight: 750;
        }

        > .text {
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
