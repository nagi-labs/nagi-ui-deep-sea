<script setup lang="ts">
import { ref } from "vue";

import { NButton } from "../components/nagi";

const disabledActivations = ref(0);
const activations = ref(0);
const submission = ref("none");
</script>

<template>
  <main class="deep-sea-button-contract-view">
    <h1>Deep Sea Button contract fixture</h1>

    <n-button class="n-button">Deep Sea save</n-button>
    <n-button
      class="n-button"
      disabled
    >
      Deep Sea native disabled
    </n-button>
    <n-button
      class="n-button"
      disabled
      focusable-when-disabled
      @click="disabledActivations += 1"
    >
      Deep Sea focusable disabled
    </n-button>
    <output
      role="status"
      aria-label="Deep Sea disabled activations"
    >
      {{ disabledActivations }}
    </output>

    <n-button
      class="n-button"
      data-contract-owner="deep-sea"
      @click="activations += 1"
    >
      Deep Sea activate
    </n-button>
    <output
      role="status"
      aria-label="Deep Sea button activations"
    >
      {{ activations }}
    </output>

    <form
      class="form"
      @submit.prevent="submission = 'submitted'"
    >
      <label class="label">
        Deep Sea form value
        <input
          class="input"
          name="value"
          value="initial"
        />
      </label>
      <n-button class="n-button">Deep Sea form action</n-button>
      <n-button
        class="n-button"
        type="submit"
      >
        Deep Sea submit
      </n-button>
      <n-button
        class="n-button"
        type="reset"
      >
        Deep Sea reset
      </n-button>
    </form>
    <output
      role="status"
      aria-label="Deep Sea submission result"
    >
      {{ submission }}
    </output>

    <n-button class="-contract n-button">Deep Sea styled action</n-button>
  </main>
</template>

<style scoped>
.deep-sea-button-contract-view {
  display: grid;
  gap: var(--nagi-space-item-gap);
  max-inline-size: 48rem;
  padding: var(--nagi-space-surface-inset);

  > .n-button.-contract {
    --button-tone: danger;
    --button-appearance: outlined;
    --button-shape: rounded;
    --button-size: small;
  }

  > .form {
    display: flex;
    flex-wrap: wrap;
    gap: var(--nagi-space-item-gap);
    align-items: end;

    > .label {
      display: grid;
      gap: var(--n-space-2);

      > .input {
        min-block-size: var(--nagi-size-control);
        padding: var(--nagi-space-control);
        border: var(--n-border-width-1) solid var(--nagi-color-border);
        border-radius: var(--nagi-radius-control);
        background: var(--nagi-color-surface);
        color: var(--nagi-color-text);
        font: inherit;
      }
    }
  }
}
</style>
