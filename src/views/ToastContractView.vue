<script setup lang="ts">
import { onBeforeUnmount } from "vue";

import { createToastManager } from "@nagi-labs/nagi-ui";

import { NButton, NToast } from "../components/nagi";

const manager = createToastManager({ duration: 0, limit: 3 });
const secondaryManager = createToastManager({ duration: 0, limit: 3 });
let toastCount = 0;
let syncRevision = 0;

function showToast() {
  toastCount += 1;
  manager.add({
    title: "Catalog update",
    description: `Catalog notification ${toastCount}`,
  });
}

function showUndoToast() {
  manager.add({
    id: "catalog-undo",
    title: "Item archived",
    description: "The item can be restored.",
    tone: "warning",
    action: {
      label: "Undo",
      onClick(id) {
        manager.close(id);
      },
    },
  });
}

function removeUndoAction() {
  manager.update("catalog-undo", { action: null });
}

function upsertToast() {
  syncRevision += 1;
  manager.add({
    id: "catalog-sync",
    title: "Sync status",
    description: `Revision ${syncRevision}`,
    tone: syncRevision > 1 ? "success" : "accent",
  });
}

function fillToastLimit() {
  manager.close();
  for (const number of [1, 2, 3, 4]) {
    manager.add({ id: `limited-${number}`, description: `Limited notification ${number}` });
  }
}

function showUrgentToast() {
  manager.add({
    id: "catalog-urgent",
    title: "Connection lost",
    description: "Changes are not being saved.",
    tone: "danger",
    priority: "assertive",
  });
}

function showTimedToast() {
  manager.add({
    id: "catalog-timed",
    description: "This notification pauses while focused.",
    duration: 200,
  });
}

function showSecondaryToast() {
  secondaryManager.add({ description: "Secondary notification" });
}

function runSuccessfulPromise() {
  void manager.promise(Promise.resolve("2 records"), {
    loading: { description: "Saving records", tone: "accent" },
    success: (result) => ({
      title: "Save complete",
      description: `${result} saved`,
      tone: "success",
    }),
    error: { title: "Save failed", description: "Try again", tone: "danger" },
  });
}

onBeforeUnmount(() => {
  manager.dispose();
  secondaryManager.dispose();
});
</script>

<template>
  <main>
    <n-button @click="showToast">Show toast</n-button>
    <n-button @click="showUndoToast">Show undo toast</n-button>
    <n-button @click="removeUndoAction">Remove undo action</n-button>
    <n-button @click="upsertToast">Upsert sync toast</n-button>
    <n-button @click="fillToastLimit">Fill toast limit</n-button>
    <n-button @click="showUrgentToast">Show urgent toast</n-button>
    <n-button @click="showTimedToast">Show timed toast</n-button>
    <n-button @click="showSecondaryToast">Show secondary toast</n-button>
    <n-button @click="runSuccessfulPromise">Run successful promise</n-button>
    <n-button @click="manager.close()">Close all notifications</n-button>
    <n-toast
      :manager="manager"
      label="Deep Sea contract notifications"
      force-motion-preview
    />
    <n-toast
      :manager="secondaryManager"
      label="Deep Sea secondary notifications"
      force-motion-preview
    />
  </main>
</template>
