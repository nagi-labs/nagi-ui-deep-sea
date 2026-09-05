// @deep-sea-source dialog/useDeepSeaDialog.ts@1
import { ref, watch, type Ref } from "vue";

import { useDialog, type DialogClosedBy } from "@nagi-labs/nagi-ui";

interface DeepSeaDialogOptions {
  readonly description?: string;
  readonly modal: boolean;
  readonly closedby: DialogClosedBy;
}

const hiddenSurface = {
  opacity: 0,
  filter: "blur(10px)",
  z: -100,
  rotateY: 25,
  rotateX: 5,
  transformPerspective: 500,
};

const surfaceVariants = {
  hidden: hiddenSurface,
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    z: 0,
    rotateY: 0,
    rotateX: 0,
    transition: {
      delay: 0.2,
      duration: 0.5,
      ease: [0.17, 0.67, 0.51, 1] as const,
      opacity: {
        delay: 0.2,
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  },
  exiting: {
    ...hiddenSurface,
    transition: { duration: 0.3, ease: [0.67, 0.17, 0.62, 0.64] as const },
  },
};

const triggerHoverState = { scale: 1.03 };
const triggerPressState = { scale: 0.97 };
const triggerTransition = { type: "spring" as const, stiffness: 500, damping: 30 };

/** Keeps the native dialog active while Motion releases its visual surface. */
export function useDeepSeaDialog(
  options: DeepSeaDialogOptions,
  requestedOpen: Ref<boolean>,
) {
  const nativeOpen = ref(requestedOpen.value);
  const surfacePresent = ref(requestedOpen.value);
  const nativeDialog = useDialog({
    open: nativeOpen,
    modal: options.modal,
    closedby: options.closedby,
  });
  const titleId = `${nativeDialog.id}-title`;
  const descriptionId = `${nativeDialog.id}-description`;
  let closePending = false;

  function show() {
    requestedOpen.value = true;
  }

  function close() {
    requestedOpen.value = false;
  }

  function toggle() {
    requestedOpen.value = !requestedOpen.value;
  }

  function handleTriggerClick(event: MouseEvent) {
    event.preventDefault();
    show();
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

  watch(requestedOpen, reconcileRequestedOpen, { flush: "sync" });
  watch(nativeOpen, reconcileNativeOpen, { flush: "sync" });

  return {
    ...nativeDialog,
    close,
    descriptionId,
    dialogProps: { ...nativeDialog.dialogProps, onCancel: handleCancel },
    finishSurfaceAnimation,
    show,
    surfacePresent,
    surfaceVariants,
    titleId,
    toggle,
    triggerHoverState,
    triggerPressState,
    triggerProps: { ...nativeDialog.triggerProps, onClick: handleTriggerClick },
    triggerTransition,
  };
}
