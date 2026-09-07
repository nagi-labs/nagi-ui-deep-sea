<!-- @deep-sea-source combobox/Combobox.vue@1 -->
<script lang="ts">
export interface ComboboxOption {
  key: string;
  label: string;
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { motion, MotionConfig } from "motion-v";
import { useId, type StyleValue } from "vue";

import { useDeepSeaCombobox } from "./useDeepSeaCombobox";
import { useUserReducedMotion } from "../../../composables/useUserReducedMotion";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label: string;
    items: readonly ComboboxOption[];
    id?: string;
    class?: string;
    style?: StyleValue;
    placeholder?: string;
    inputmode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
    enterkeyhint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
    autocapitalize?: "none" | "off" | "on" | "sentences" | "words" | "characters";
    autocorrect?: "on" | "off";
    autofocus?: boolean;
    dirname?: string;
    list?: string;
    size?: number;
    spellcheck?: boolean;
    tabindex?: number;
    minlength?: number;
    maxlength?: number;
    pattern?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    ariaDetails?: string;
    ariaErrormessage?: string;
    ariaPlaceholder?: string;
    title?: string;
    autocomplete?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    form?: string;
    clearable?: boolean;
    clearLabel?: string;
    emptyText?: string;
    loading?: boolean;
    loadingText?: string;
    validationMessage?: string;
    forceMotionPreview?: boolean;
  }>(),
  {
    autocomplete: "off",
    disabled: false,
    readOnly: false,
    required: false,
    clearable: false,
    clearLabel: "Clear selection",
    emptyText: "No results",
    loading: false,
    loadingText: "Loading…",
    validationMessage: "Select an option.",
    forceMotionPreview: false,
  },
);
const emit = defineEmits<{
  input: [event: Event];
  compositionstart: [event: CompositionEvent];
  compositionend: [event: CompositionEvent];
  click: [event: MouseEvent];
  keydown: [event: KeyboardEvent];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const inputValue = defineModel<string>({ default: "" });
const selected = defineModel<string | null>("selected", { default: null });
const labelId = useId();
const combobox = useDeepSeaCombobox(props, inputValue, selected);
const { activeKey, open, visibleItems } = combobox;
const userPrefersReducedMotion = useUserReducedMotion();
</script>

<template>
  <div
    data-scope="combobox"
    data-part="root"
    class="n-combobox"
    :class="props.class"
    :style="props.style"
  >
    <label
      :id="labelId"
      data-scope="combobox"
      data-part="label"
      class="label"
      :for="combobox.inputId"
      >{{ label }}</label
    >
    <div class="unit -control">
      <input
        data-scope="combobox"
        data-part="input"
        class="input"
        type="text"
        :inputmode="inputmode"
        :enterkeyhint="enterkeyhint"
        :autocapitalize="autocapitalize"
        :autocorrect="autocorrect"
        :autofocus="autofocus"
        :dirname="dirname"
        :list="list"
        :size="size"
        :spellcheck="spellcheck"
        :tabindex="tabindex"
        :minlength="minlength"
        :maxlength="maxlength"
        :pattern="pattern"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-details="ariaDetails"
        :aria-errormessage="ariaErrormessage"
        :aria-placeholder="ariaPlaceholder"
        :title="title"
        :autocomplete="autocomplete"
        :form="form"
        :placeholder="placeholder"
        :aria-busy="loading ? 'true' : undefined"
        v-bind="combobox.inputProps"
        @input="emit('input', $event)"
        @compositionstart="emit('compositionstart', $event)"
        @compositionend="emit('compositionend', $event)"
        @click="emit('click', $event)"
        @keydown="emit('keydown', $event)"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />
      <button
        v-if="clearable && !disabled && !readOnly && (selected !== null || inputValue !== '')"
        class="button"
        type="button"
        :aria-label="clearLabel"
        @click="combobox.clear"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <input
      v-if="name"
      class="input -form-value"
      type="hidden"
      :name="name"
      :form="form"
      :value="selected ?? ''"
      :disabled="disabled"
    />
    <div
      class="unit -popup"
      data-scope="combobox"
      data-part="popup"
      popover
      :aria-busy="loading ? 'true' : undefined"
      v-bind="combobox.popupProps"
    >
      <motion-config
        :reduced-motion="forceMotionPreview ? 'never' : userPrefersReducedMotion ? 'always' : 'never'"
      >
        <motion.div
          class="seg -surface"
          data-motion-combobox-surface
          :data-motion-policy="forceMotionPreview ? 'animated' : userPrefersReducedMotion ? 'reduced' : 'animated'"
          :initial="false"
          :variants="combobox.popupVariants"
          :animate="open ? 'open' : 'closed'"
          :transition="combobox.popupTransition"
        >
          <ul
            class="list"
            data-scope="combobox"
            data-part="listbox"
            :aria-labelledby="labelId"
            v-bind="combobox.listboxProps"
          >
            <li
              v-for="item in visibleItems"
              :key="item.key"
              class="item"
              data-scope="combobox"
              data-part="option"
              v-bind="combobox.optionProps(item)"
            >
              <motion.span
                v-if="activeKey === item.key"
                class="fr -active-indicator"
                data-motion-active-indicator
                aria-hidden="true"
                :layout-id="`${combobox.id}-active-indicator`"
                :transition="combobox.indicatorTransition"
              />
              <span class="text">{{ item.label }}</span>
            </li>
          </ul>
          <div
            v-if="loading"
            class="status"
            role="status"
          >
            {{ loadingText }}
          </div>
          <div
            v-else-if="visibleItems.length === 0"
            class="status"
            role="status"
          >
            {{ emptyText }}
          </div>
        </motion.div>
      </motion-config>
    </div>
  </div>
</template>

<style scoped>
.n-combobox {
  --local-label-tracking: 0.05em;

  display: inline-grid;
  min-inline-size: 16rem;
  color: var(--nagi-color-text);

  > .label {
    margin-block-end: var(--n-space-3);
    color: var(--nagi-color-text-muted);
    font-size: var(--nagi-font-size-label);
    font-weight: 750;
    letter-spacing: var(--local-label-tracking);
    text-transform: uppercase;
  }

  > .unit {
    &.-control {
      position: relative;

      > .input {
        inline-size: 100%;
        box-sizing: border-box;
        padding: var(--nagi-space-control);
        padding-inline-end: calc(2 * var(--n-space-8) + var(--n-space-2));
        border: var(--n-border-width-1) solid var(--nagi-color-border);
        border-radius: var(--nagi-radius-control);
        outline: none;
        background: var(--nagi-color-surface);
        color: inherit;
        font: inherit;

        &:focus-visible,
        &[aria-expanded="true"] {
          border-color: var(--nagi-color-focus-ring);
          box-shadow: var(--nagi-shadow-focus);
        }

        &:disabled {
          color: var(--nagi-color-text-disabled);
          background: var(--nagi-color-surface-accent);
        }

        &:read-only {
          color: var(--nagi-color-text-muted);
          background: var(--nagi-color-surface-accent);
        }

        &::placeholder {
          color: var(--nagi-color-text-disabled);
        }
      }

      > .button {
        position: absolute;
        inset-block: 0;
        inset-inline-end: 0.35rem;
        inline-size: 1.75rem;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--nagi-color-text-muted);
        font: inherit;
        cursor: pointer;
      }
    }

    &.-popup {
      margin: 0;
      padding: 0;
      overflow: visible;
      border: 0;
      outline: none;
      background: transparent;
      transform-origin: top;

      > .seg.-surface {
        min-inline-size: 16rem;
        max-block-size: 15rem;
        padding: var(--nagi-space-surface-inset);
        overflow-y: auto;
        border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
        border-radius: var(--nagi-radius-overlay);
        background: var(--nagi-color-surface);
        box-shadow: var(--nagi-shadow-overlay);
        color: var(--nagi-color-text);

        > .list {
          margin: 0;
          padding: 0;
          list-style: none;

          > .item {
            position: relative;
            box-sizing: border-box;
            min-block-size: var(--nagi-size-control);
            padding: var(--nagi-space-item);
            border-radius: var(--nagi-radius-item);
            cursor: pointer;

            &[aria-selected="true"] {
              outline: 2px solid var(--nagi-color-focus-ring);
              outline-offset: calc(-1 * var(--n-border-width-2));
            }

            > .fr.-active-indicator {
              position: absolute;
              inset: 0;
              border: var(--n-border-width-1) solid
                color-mix(in srgb, var(--nagi-color-accent) 52%, transparent);
              border-radius: inherit;
              background: color-mix(
                in srgb,
                var(--nagi-color-accent) 16%,
                var(--nagi-color-surface-active)
              );
              box-shadow:
                inset var(--n-border-width-2) 0 var(--nagi-color-accent),
                0 0 var(--n-space-5)
                  color-mix(in srgb, var(--nagi-color-accent) 12%, transparent);
            }

            > .text {
              position: relative;
            }

            &[aria-disabled="true"] {
              color: var(--nagi-color-text-disabled);
              cursor: not-allowed;
            }
          }
        }

        > .status {
          box-sizing: border-box;
          min-block-size: var(--nagi-size-control);
          padding: var(--nagi-space-item);
          color: var(--nagi-color-text-muted);
          list-style: none;
        }
      }
    }
  }
}

@media (forced-colors: active) {
  .n-combobox {
    > .unit.-control {
      > .input:focus-visible {
        outline: 2px solid Highlight;
        outline-offset: var(--n-border-width-2);
      }
    }
  }
}
</style>
