<!-- @nagi-source dialog/Dialog.vue@0.1.0 -->
<script setup lang="ts">
import { AnimatePresence, motion, useReducedMotion } from "motion-v";
import { computed, ref, watch, type StyleValue } from "vue";

import { useDialog, type DialogClosedBy } from "@nagi-labs/nagi-ui";

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
const nativeOpen = ref(requestedOpen.value);
const surfacePresent = ref(requestedOpen.value);
const dialog = useDialog(props, nativeOpen);
const titleId = `${dialog.id}-title`;
const descriptionId = `${dialog.id}-description`;
const userPrefersReducedMotion = useReducedMotion();
const reduceMotion = computed(
  () => !props.forceMotionPreview && userPrefersReducedMotion.value,
);
const surfaceHiddenState = computed(() =>
  reduceMotion.value
    ? { opacity: 0 }
    : {
        opacity: 0,
        filter: "blur(10px)",
        z: -100,
        rotateY: 25,
        rotateX: 5,
        transformPerspective: 500,
      },
);
const surfaceEnterTransition = computed(() =>
  reduceMotion.value
    ? { duration: 0 }
    : {
        delay: 0.2,
        duration: 0.5,
        ease: [0.17, 0.67, 0.51, 1] as const,
        opacity: {
          delay: 0.2,
          duration: 0.5,
          ease: "easeOut" as const,
        },
      },
);
const surfaceExitTransition = computed(() =>
  reduceMotion.value
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.67, 0.17, 0.62, 0.64] as const },
);
const surfaceOpenState = computed(() => ({
  opacity: 1,
  filter: "blur(0px)",
  z: 0,
  rotateY: 0,
  rotateX: 0,
  transition: surfaceEnterTransition.value,
}));
const surfaceExitState = computed(() => ({
  ...surfaceHiddenState.value,
  transition: surfaceExitTransition.value,
}));
const triggerHoverState = computed(() => (reduceMotion.value ? undefined : { scale: 1.03 }));
const triggerPressState = computed(() => (reduceMotion.value ? undefined : { scale: 0.97 }));
const triggerTransition = { type: "spring" as const, stiffness: 500, damping: 30 };
let closePending = false;

function show() {
  requestedOpen.value = true;
}

function close() {
  requestedOpen.value = false;
}

function toggle() {
  if (requestedOpen.value) close();
  else show();
}

function handleTriggerClick(event: MouseEvent) {
  event.preventDefault();
  show();
}

function handleCloseClick(event: MouseEvent) {
  event.preventDefault();
  close();
}

function handleCancel(event: Event) {
  event.preventDefault();
  close();
}

function reconcileRequestedOpen(nextOpen: boolean) {
  if (nextOpen) {
    closePending = false;
    nativeOpen.value = true;
    surfacePresent.value = true;
    return;
  }

  if (!nativeOpen.value) {
    surfacePresent.value = false;
    return;
  }

  closePending = true;
  surfacePresent.value = false;
}

function reconcileNativeOpen(nextOpen: boolean) {
  if (nextOpen) return;

  closePending = false;
  surfacePresent.value = false;
  if (requestedOpen.value) requestedOpen.value = false;
}

function finishSurfaceAnimation() {
  if (!closePending || requestedOpen.value || surfacePresent.value) return;

  closePending = false;
  nativeOpen.value = false;
}

const triggerProps = {
  ...dialog.triggerProps,
  onClick: handleTriggerClick,
};

watch(requestedOpen, reconcileRequestedOpen, { flush: "sync" });
watch(nativeOpen, reconcileNativeOpen, { flush: "sync" });

defineExpose({ show, close, toggle });
</script>

<template>
  <div
    data-scope="dialog"
    data-part="root"
    class="n-dialog"
    :id="id"
    :class="props.class"
    :style="props.style"
  >
    <motion.button
      data-scope="dialog"
      data-part="trigger"
      class="button -trigger"
      type="button"
      v-bind="triggerProps"
      :while-hover="triggerHoverState"
      :while-press="triggerPressState"
      :transition="triggerTransition"
    >
      {{ triggerLabel }}
    </motion.button>
    <dialog
      class="dialog"
      data-scope="dialog"
      data-part="surface"
      :aria-labelledby="titleId"
      :aria-describedby="description || $slots.description ? descriptionId : undefined"
      :data-motion-policy="reduceMotion ? 'reduced' : 'animated'"
      :data-motion-state="surfacePresent ? 'open' : 'closing'"
      v-bind="dialog.dialogProps"
      @cancel="handleCancel"
    >
      <AnimatePresence
        :initial="false"
        @exit-complete="finishSurfaceAnimation"
      >
        <motion.div
          v-if="surfacePresent"
          key="dialog-surface"
          class="unit -surface"
          data-motion-dialog-surface
          :initial="surfaceHiddenState"
          :animate="surfaceOpenState"
          :exit="surfaceExitState"
        >
          <header class="header">
            <h2
              data-scope="dialog"
              data-part="title"
              :id="titleId"
              class="title"
            >
              <slot
                name="title"
                :title="title"
                >{{ title }}</slot
              >
            </h2>
            <p
              v-if="description || $slots.description"
              data-scope="dialog"
              data-part="description"
              :id="descriptionId"
              class="p"
            >
              <slot
                name="description"
                :description="description"
                >{{ description }}</slot
              >
            </p>
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
              @click="handleCloseClick"
            >
              {{ closeLabel }}
            </button>
          </footer>
        </motion.div>
      </AnimatePresence>
    </dialog>
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

        > .p {
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
