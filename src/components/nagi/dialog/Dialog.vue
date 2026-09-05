<!-- @deep-sea-source dialog/Dialog.vue@1 -->
<script setup lang="ts">
import { AnimatePresence, motion, MotionConfig } from "motion-v";
import type { StyleValue } from "vue";

import { type DialogClosedBy } from "@nagi-labs/nagi-ui";
import { useDeepSeaDialog } from "./useDeepSeaDialog";

const props = withDefaults(
  defineProps<{
    triggerLabel: string;
    title: string;
    id?: string;
    class?: string;
    style?: StyleValue;
    description?: string;
    closeLabel?: string;
    modal?: boolean;
    closedby?: DialogClosedBy;
    forceMotionPreview?: boolean;
  }>(),
  {
    closeLabel: "Close",
    modal: true,
    closedby: "any",
    forceMotionPreview: false,
  },
);
defineOptions({ inheritAttrs: false });

const requestedOpen = defineModel<boolean>("open", { default: false });
const dialog = useDeepSeaDialog(props, requestedOpen);

defineExpose({ show: dialog.show, close: dialog.close, toggle: dialog.toggle });
</script>

<template>
  <div
    :id="id"
    :class="props.class"
    :style="props.style"
    data-scope="dialog"
    data-part="root"
    class="n-dialog"
  >
    <motion-config :reduced-motion="forceMotionPreview ? 'never' : 'user'">
      <motion.button
        data-scope="dialog"
        data-part="trigger"
        class="button -trigger"
        type="button"
        v-bind="dialog.triggerProps"
        :while-hover="dialog.triggerHoverState"
        :while-press="dialog.triggerPressState"
        :transition="dialog.triggerTransition"
      >
        {{ triggerLabel }}
      </motion.button>
      <dialog
        class="dialog"
        data-scope="dialog"
        data-part="surface"
        :aria-labelledby="dialog.titleId"
        :aria-describedby="description || $slots.description ? dialog.descriptionId : undefined"
        :data-motion-policy="forceMotionPreview ? 'animated' : 'user'"
        :data-motion-state="dialog.surfacePresent.value ? 'open' : 'closing'"
        v-bind="dialog.dialogProps"
      >
        <AnimatePresence
          :initial="false"
          @exit-complete="dialog.finishSurfaceAnimation"
        >
          <motion.div
            v-if="dialog.surfacePresent.value"
            key="dialog-surface"
            class="unit -surface"
            data-motion-dialog-surface
            :variants="dialog.surfaceVariants"
            initial="hidden"
            animate="visible"
            exit="exiting"
          >
            <header class="header">
              <h2
                :id="dialog.titleId"
                data-scope="dialog"
                data-part="title"
                class="title"
              >
                <slot
                  name="title"
                  :title="title"
                >
                  {{ title }}
                </slot>
              </h2>
              <div
                v-if="description || $slots.description"
                :id="dialog.descriptionId"
                data-scope="dialog"
                data-part="description"
                class="seg -description"
              >
                <slot
                  name="description"
                  :description="description"
                >
                  <span class="text">{{ description }}</span>
                </slot>
              </div>
            </header>
            <section class="section">
              <slot />
            </section>
            <footer class="footer">
              <slot name="actions" />
              <button
                data-scope="dialog"
                data-part="close"
                class="button -close"
                type="button"
                @click="dialog.close"
              >
                {{ closeLabel }}
              </button>
            </footer>
          </motion.div>
        </AnimatePresence>
      </dialog>
    </motion-config>
  </div>
</template>

<style scoped>
.n-dialog {
  display: inline-block;
  color: var(--nagi-color-text);

  > .button {
    min-block-size: var(--nagi-size-control);
    padding: var(--nagi-space-control);
    border: var(--n-border-width-1) solid var(--nagi-color-border);
    border-radius: var(--nagi-radius-control);
    background: var(--nagi-color-surface);
    color: inherit;
    font: inherit;
    cursor: pointer;

    &:hover {
      background: var(--nagi-color-surface-active);
    }

    &:focus-visible {
      outline: none;
      border-color: var(--nagi-color-focus-ring);
      box-shadow: var(--nagi-shadow-focus);
    }
  }

  > .dialog {
    inline-size: min(30rem, calc(100vi - 2rem));
    padding: 0;
    overflow: visible;
    border: 0;
    background: transparent;
    color: var(--nagi-color-text);

    &::backdrop {
      background: var(
        --dialog-backdrop-background,
        color-mix(in srgb, var(--nagi-color-text) 45%, transparent)
      );
      backdrop-filter: var(--dialog-backdrop-filter, none);
      opacity: 1;
      transition: opacity 0.18s ease;

      @starting-style {
        opacity: 0;
      }
    }

    &[data-motion-state="closing"] {
      pointer-events: none;

      &::backdrop {
        opacity: 0;
      }
    }

    > .unit.-surface {
      overflow: hidden;
      border: var(--n-border-width-1) solid
        var(--dialog-surface-border-color, var(--nagi-color-border-muted));
      border-radius: var(--nagi-radius-overlay);
      background: var(--dialog-surface-background, var(--nagi-color-surface));
      box-shadow: var(--nagi-shadow-overlay);
      transform-origin: center;

      > .header {
        padding: var(--n-space-8) var(--n-space-8) 0;

        > .title {
          margin: 0;
          font-size: var(--n-font-size-5);
        }

        > .unit.-description {
          margin-block: var(--n-space-3) 0;
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-3);
        }
      }

      > .section {
        padding: var(--n-space-7) var(--n-space-8);
      }

      > .footer {
        display: flex;
        gap: var(--n-space-5);
        justify-content: flex-end;
        padding: 0 var(--n-space-8) var(--n-space-8);

        > .button {
          min-block-size: var(--nagi-size-control);
          padding: var(--nagi-space-control);
          border: var(--n-border-width-1) solid var(--nagi-color-border);
          border-radius: var(--nagi-radius-control);
          background: var(--nagi-color-surface);
          color: inherit;
          font: inherit;
          cursor: pointer;

          &:hover {
            background: var(--nagi-color-surface-active);
          }

          &:focus-visible {
            outline: none;
            border-color: var(--nagi-color-focus-ring);
            box-shadow: var(--nagi-shadow-focus);
          }
        }
      }
    }
  }
}

@media (forced-colors: active) {
  .n-dialog {
    > .button:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: var(--n-border-width-2);
    }

    > .dialog {
      > .unit.-surface {
        > .footer {
          > .button:focus-visible {
            outline: 2px solid Highlight;
            outline-offset: var(--n-border-width-2);
          }
        }
      }
    }
  }
}
</style>
