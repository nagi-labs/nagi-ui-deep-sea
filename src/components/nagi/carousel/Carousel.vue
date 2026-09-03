<!-- @nagi-source carousel/Carousel.vue@0.1.0 -->
<script lang="ts">
export interface CarouselItem {
  key: string;
  label: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}
</script>

<script setup lang="ts">
import { AnimatePresence, motion, useReducedMotion } from "motion-v";
import { computed, ref, watch, type StyleValue } from "vue";

import { useCarousel } from "@nagi-labs/nagi-ui";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    items: readonly CarouselItem[];
    id?: string;
    class?: string;
    style?: StyleValue;
    title?: string;
    label: string;
    carouselRoleDescription?: string;
    slideRoleDescription?: string;
    landmark?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    formatAnnouncement?: (position: number | null, count: number) => string;
    formatSlideLabel?: (item: CarouselItem, position: number, count: number) => string;
    loop?: boolean;
    disabled?: boolean;
    forceMotionPreview?: boolean;
  }>(),
  {
    landmark: false,
    carouselRoleDescription: "carousel",
    slideRoleDescription: "slide",
    previousLabel: "Previous slide",
    nextLabel: "Next slide",
    loop: false,
    disabled: false,
    forceMotionPreview: false,
  },
);

const index = defineModel<number>({ default: 0 });
const carousel = useCarousel({
  items: () => props.items,
  index,
  label: () => props.label,
  carouselRoleDescription: () => props.carouselRoleDescription,
  slideRoleDescription: () => props.slideRoleDescription,
  landmark: () => props.landmark,
  previousLabel: () => props.previousLabel,
  nextLabel: () => props.nextLabel,
  formatAnnouncement: props.formatAnnouncement,
  formatSlideLabel: props.formatSlideLabel,
  loop: () => props.loop,
  disabled: () => props.disabled,
  id: props.id,
});
const userPrefersReducedMotion = useReducedMotion();
const reduceMotion = computed(
  () => !props.forceMotionPreview && userPrefersReducedMotion.value,
);
const currentSlide = computed(() => {
  const itemIndex = carousel.currentIndex.value;
  const item = props.items[itemIndex];
  return item ? { item, itemIndex } : null;
});
const transitionDirection = ref<1 | -1>(1);
let previousAcceptedIndex = carousel.currentIndex.value;

function resolveSlideDirection(value: unknown): 1 | -1 {
  return value === -1 ? -1 : 1;
}

watch(carousel.currentIndex, (nextIndex) => {
  const lastIndex = props.items.length - 1;
  if (props.loop && previousAcceptedIndex === 0 && nextIndex === lastIndex) {
    transitionDirection.value = -1;
  } else if (props.loop && previousAcceptedIndex === lastIndex && nextIndex === 0) {
    transitionDirection.value = 1;
  } else {
    transitionDirection.value = nextIndex >= previousAcceptedIndex ? 1 : -1;
  }
  previousAcceptedIndex = nextIndex;
});

const slideVariants = {
  enter(custom: unknown) {
    const direction = resolveSlideDirection(custom);
    return reduceMotion.value
      ? { opacity: 1, transform: "none" }
      : {
          opacity: 0,
          transform: `translateX(${direction * 64}px) scale(0.98)`,
        };
  },
  active: { opacity: 1, transform: "translateX(0) scale(1)" },
  exit(custom: unknown) {
    const direction = resolveSlideDirection(custom);
    return reduceMotion.value
      ? { opacity: 1, transform: "none" }
      : {
          opacity: 0,
          transform: `translateX(${direction * -64}px) scale(0.98)`,
        };
  },
};
const slideTransition = computed(() =>
  reduceMotion.value
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const },
);
</script>

<template>
  <section
    v-bind="carousel.rootProps"
    data-scope="carousel"
    data-part="root"
    class="n-carousel"
    :class="props.class"
    :style="props.style"
    :title="props.title"
  >
    <div class="actions">
      <button
        v-bind="carousel.previousButtonProps"
        class="button -previous"
      >
        ‹
      </button>
      <output
        class="output -announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ carousel.announcement.value }}
      </output>
      <button
        v-bind="carousel.nextButtonProps"
        class="button -next"
      >
        ›
      </button>
    </div>

    <div
      class="unit -presence"
      :data-motion-policy="reduceMotion ? 'reduced' : 'animated'"
    >
      <AnimatePresence
        mode="sync"
        :initial="false"
        :custom="transitionDirection"
      >
        <motion.article
          v-if="currentSlide"
          :key="currentSlide.item.key"
          v-bind="carousel.slideProps(currentSlide.item, currentSlide.itemIndex)"
          data-scope="carousel"
          data-part="slide"
          data-motion-slide=""
          class="article -slide"
          :custom="transitionDirection"
          :variants="slideVariants"
          initial="enter"
          animate="active"
          exit="exit"
          :transition="slideTransition"
        >
          <img
            v-if="currentSlide.item.imageSrc"
            class="image"
            :src="currentSlide.item.imageSrc"
            :alt="currentSlide.item.imageAlt ?? ''"
          />
          <h2
            v-bind="carousel.slideLabelProps(currentSlide.itemIndex)"
            class="title"
          >
            {{ currentSlide.item.label }}
            <span class="text -position">
              , {{ carousel.slidePosition(currentSlide.item, currentSlide.itemIndex) }}
            </span>
          </h2>
          <p
            v-if="currentSlide.item.description"
            class="p -description"
          >
            {{ currentSlide.item.description }}
          </p>
        </motion.article>
      </AnimatePresence>
    </div>
  </section>
</template>

<style scoped>
.n-carousel {
  display: grid;
  gap: var(--nagi-space-item-gap);
  color: var(--nagi-color-text);

  > .actions {
    display: flex;
    gap: var(--nagi-space-item-gap);
    align-items: center;
    justify-content: space-between;

    > .button {
      min-inline-size: var(--nagi-size-control);
      min-block-size: var(--nagi-size-control);
      border: var(--n-border-width-1) solid var(--nagi-color-border);
      border-radius: var(--nagi-radius-control);
      background: var(--nagi-color-surface);
      color: inherit;
      font: inherit;
      cursor: pointer;

      &:focus-visible {
        outline: none;
        box-shadow: var(--nagi-shadow-focus);
      }

      &:disabled,
      &[aria-disabled="true"] {
        color: var(--nagi-color-text-disabled);
        cursor: not-allowed;
      }
    }

    > .output.-announcement {
      color: var(--nagi-color-text-muted);
      font-size: var(--nagi-font-size-label);
    }
  }

  > .unit.-presence {
    position: relative;
    display: grid;
    overflow: clip;

    > .article.-slide {
      box-sizing: border-box;
      grid-area: 1 / 1;
      min-inline-size: 0;
      inline-size: 100%;
      padding: var(--nagi-space-surface-inset);
      border: var(--n-border-width-1) solid var(--nagi-color-border);
      border-radius: var(--nagi-radius-item);
      background: var(--nagi-color-surface);

      > .image {
        display: block;
        max-inline-size: 100%;
        block-size: auto;
        border-radius: var(--nagi-radius-item);
      }

      > .title {
        margin: 0;
        font-size: inherit;

        > .text.-position {
          position: absolute;
          inset: 0 auto auto 0;
          inline-size: 1px;
          block-size: 1px;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
        }
      }

      > .p.-description {
        margin-block: var(--nagi-space-item-gap) 0;
        color: var(--nagi-color-text-muted);
      }
    }
  }
}

@media (forced-colors: active) {
  .n-carousel {
    > .actions {
      > .button:focus-visible {
        outline: 2px solid Highlight;
      }
    }
  }
}
</style>
