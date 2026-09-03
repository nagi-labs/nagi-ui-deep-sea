<script setup lang="ts">
import { ref } from "vue";

import { NButton, NDialog } from "../components/nagi";

const open = ref(false);

function saveHandover() {
  open.value = false;
}
</script>

<template>
  <main>
    <n-dialog
      v-model:open="open"
      force-motion-preview
      trigger-label="Open Deep Sea dialog"
      title="Deep Sea handover"
      description="Review the operational handover before saving it."
    >
      <p>The handover contains the current station status.</p>
      <template #actions>
        <n-button @click="saveHandover">Save handover</n-button>
      </template>
    </n-dialog>
    <output
      role="status"
      aria-label="Deep Sea dialog model"
    >
      {{ open }}
    </output>
  </main>
</template>
