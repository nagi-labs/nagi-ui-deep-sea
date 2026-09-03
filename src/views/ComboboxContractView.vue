<script setup lang="ts">
import { computed, ref } from "vue";

import { NButton, NCombobox } from "../components/nagi";

const allItems = [
  { key: "vue", label: "Vue" },
  { key: "react", label: "React", disabled: true },
  { key: "svelte", label: "Svelte" },
  { key: "solid", label: "Solid" },
] as const;
const removedKeys = ref<string[]>([]);
const items = computed(() => allItems.filter((item) => !removedKeys.value.includes(item.key)));
const inputValue = ref("");
const selected = ref<string | null>(null);

function removeActiveOption() {
  removedKeys.value = [...removedKeys.value, "vue"];
}
</script>

<template>
  <main>
    <n-combobox
      v-model="inputValue"
      v-model:selected="selected"
      label="Deep Sea framework"
      :items="items"
      force-motion-preview
    />
    <n-button @click="removeActiveOption">Remove Deep Sea active option</n-button>
    <output
      role="status"
      aria-label="Deep Sea combobox input"
    >
      {{ inputValue }}
    </output>
    <output
      role="status"
      aria-label="Deep Sea combobox selection"
    >
      {{ selected ?? "none" }}
    </output>
  </main>
</template>
