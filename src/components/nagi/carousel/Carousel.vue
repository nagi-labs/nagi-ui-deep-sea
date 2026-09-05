<!-- @deep-sea-source carousel/Carousel.vue@1 -->
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
import { AnimatePresence, motion } from "motion-v";
import type { StyleValue } from "vue";

import { useDeepSeaCarousel } from "./useDeepSeaCarousel";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    items: readonly CarouselItem[];
    id?: string;
    class?: string;
    style?: StyleValue;
    title?: string;
    label: string;
    slidesLabel?: string;
    carouselRoleDescription?: string;
    slidesRoleDescription?: string;
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
    slidesRoleDescription: "slides",
    slideRoleDescription: "slide",
    previousLabel: "Previous slide",
    nextLabel: "Next slide",
    loop: false,
    disabled: false,
    forceMotionPreview: false,
  },
);

const index = defineModel<number>({ default: 0 });
const carousel = useDeepSeaCarousel(props, index);
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
        class="output"
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
      :data-motion-policy="carousel.reduceMotion.value ? 'reduced' : 'animated'"
    >
      <AnimatePresence
        mode="sync"
        :initial="false"
        :custom="carousel.transitionDirection.value"
      >
        <motion.article
          v-if="carousel.currentSlide.value"
          :key="carousel.currentSlide.value.item.key"
          v-bind="
            carousel.slideProps(
              carousel.currentSlide.value.item,
              carousel.currentSlide.value.itemIndex,
            )
          "
          data-scope="carousel"
          data-part="slide"
          data-motion-slide=""
          class="article"
          :custom="carousel.transitionDirection.value"
          :variants="carousel.slideVariants"
          initial="enter"
          animate="active"
          exit="exit"
          :transition="carousel.slideTransition.value"
        >
          <img
            v-if="carousel.currentSlide.value.item.imageSrc"
            class="image"
            :src="carousel.currentSlide.value.item.imageSrc"
            :alt="carousel.currentSlide.value.item.imageAlt ?? ''"
          />
          <h2
            v-bind="carousel.slideLabelProps(carousel.currentSlide.value.itemIndex)"
            class="title"
          >
            {{ carousel.currentSlide.value.item.label }}
            <span class="text">
              ,
              {{
                carousel.slidePosition(
                  carousel.currentSlide.value.item,
                  carousel.currentSlide.value.itemIndex,
                )
              }}
            </span>
          </h2>
          <span
            v-if="carousel.currentSlide.value.item.description"
            class="text"
          >
            {{ carousel.currentSlide.value.item.description }}
          </span>
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

    > .output {
      color: var(--nagi-color-text-muted);
      font-size: var(--nagi-font-size-label);
    }
  }

  > .unit.-presence {
    position: relative;
    display: grid;
    overflow: clip;

    > .article {
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

        > .text {
          position: absolute;
          inset: 0 auto auto 0;
          inline-size: 1px;
          block-size: 1px;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
        }
      }

      > .text {
        display: block;
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
