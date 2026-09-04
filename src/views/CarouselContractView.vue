<script setup lang="ts">
import { useReducedMotion } from "motion-v";
import { ref } from "vue";

import { NCarousel } from "../components/nagi";

const items = [
  { key: "alpha", label: "Abyssal relay", description: "The first accepted slide." },
  { key: "beta", label: "Pelagic array", description: "The second accepted slide." },
  { key: "gamma", label: "Hadal station", description: "The third accepted slide." },
] as const;

const mainIndex = ref(0);
const loopedIndex = ref(0);
const rejectedIndex = ref(0);
const rejectedRequests = ref(0);
const boundedIndex = ref(99);
const disabledIndex = ref(0);
const reduceMotion = useReducedMotion();
const appVersion = __DEEP_SEA_VERSION__;
</script>

<template>
  <main class="deep-sea-carousel-contract-view">
    <h1>Deep Sea Carousel contract fixture</h1>
    <span class="text">
      v{{ appVersion }} · Motion policy:
      {{ reduceMotion ? "reduced by browser preference" : "animated" }}
    </span>

    <n-carousel
      v-model="mainIndex"
      class="n-carousel"
      :items="items"
      label="Deep Sea release highlights"
      landmark
    />
    <output
      role="status"
      aria-label="Deep Sea carousel model"
    >
      {{ mainIndex }}
    </output>
    <button
      type="button"
      @click="mainIndex = 2"
    >
      Set Deep Sea carousel to third
    </button>

    <n-carousel
      v-model="loopedIndex"
      class="n-carousel"
      :items="items"
      label="Deep Sea looped highlights"
      loop
    />
    <output
      role="status"
      aria-label="Deep Sea looped carousel model"
    >
      {{ loopedIndex }}
    </output>

    <n-carousel
      class="n-carousel"
      :model-value="rejectedIndex"
      :items="items"
      label="Deep Sea locked highlights"
      @update:model-value="rejectedRequests += 1"
    />
    <output
      role="status"
      aria-label="Deep Sea locked carousel model"
    >
      {{ rejectedIndex }}
    </output>
    <output
      role="status"
      aria-label="Deep Sea locked carousel requests"
    >
      {{ rejectedRequests }}
    </output>

    <n-carousel
      v-model="boundedIndex"
      class="n-carousel"
      :items="items"
      label="Deep Sea bounded highlights"
    />
    <output
      role="status"
      aria-label="Deep Sea bounded carousel model"
    >
      {{ boundedIndex }}
    </output>

    <n-carousel
      v-model="disabledIndex"
      class="n-carousel"
      :items="items"
      label="Deep Sea disabled highlights"
      disabled
      landmark
    />
    <output
      role="status"
      aria-label="Deep Sea disabled carousel model"
    >
      {{ disabledIndex }}
    </output>
    <button
      type="button"
      @click="disabledIndex = 1"
    >
      Set Deep Sea disabled carousel to second
    </button>
  </main>
</template>

<style scoped>
.deep-sea-carousel-contract-view {
  display: grid;
  gap: var(--nagi-space-item-gap);
  max-inline-size: 48rem;
  padding: var(--nagi-space-surface-inset);

  > .text {
    margin: 0;
    color: var(--nagi-color-text-muted);
  }

  > .n-carousel {
    padding: var(--n-space-6);
    border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
    border-radius: var(--nagi-radius-overlay);
  }
}
</style>
