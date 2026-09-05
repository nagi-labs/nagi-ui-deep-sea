// @deep-sea-source carousel/useDeepSeaCarousel.ts@1
import { useReducedMotion } from "motion-v";
import { computed, ref, watch, type Ref } from "vue";

import {
  useCarousel,
  type CarouselComponentProps,
} from "@nagi-labs/nagi-ui";

interface DeepSeaCarouselOptions<Item> extends CarouselComponentProps<Item> {
  readonly forceMotionPreview: boolean;
}

/** Adds keyed horizontal presence to Nagi's complete Carousel behavior. */
export function useDeepSeaCarousel<Item>(
  options: DeepSeaCarouselOptions<Item>,
  index: Ref<number>,
) {
  const carousel = useCarousel(options, index);
  const userPrefersReducedMotion = useReducedMotion();
  const reduceMotion = computed(
    () => !options.forceMotionPreview && userPrefersReducedMotion.value,
  );
  const currentSlide = computed(() => {
    const itemIndex = carousel.currentIndex.value;
    const item = options.items[itemIndex];
    return item ? { item, itemIndex } : null;
  });
  const transitionDirection = ref<1 | -1>(1);
  let previousAcceptedIndex = carousel.currentIndex.value;

  function resolveDirection(value: unknown): 1 | -1 {
    return value === -1 ? -1 : 1;
  }

  watch(carousel.currentIndex, (nextIndex) => {
    const lastIndex = options.items.length - 1;
    if (options.loop && previousAcceptedIndex === 0 && nextIndex === lastIndex) {
      transitionDirection.value = -1;
    } else if (options.loop && previousAcceptedIndex === lastIndex && nextIndex === 0) {
      transitionDirection.value = 1;
    } else {
      transitionDirection.value = nextIndex >= previousAcceptedIndex ? 1 : -1;
    }
    previousAcceptedIndex = nextIndex;
  });

  const slideVariants = {
    enter(custom: unknown) {
      const direction = resolveDirection(custom);
      return reduceMotion.value
        ? { opacity: 1, transform: "none" }
        : { opacity: 0, transform: `translateX(${direction * 64}px) scale(0.98)` };
    },
    active: { opacity: 1, transform: "translateX(0) scale(1)" },
    exit(custom: unknown) {
      const direction = resolveDirection(custom);
      return reduceMotion.value
        ? { opacity: 1, transform: "none" }
        : { opacity: 0, transform: `translateX(${direction * -64}px) scale(0.98)` };
    },
  };
  const slideTransition = computed(() =>
    reduceMotion.value
      ? { duration: 0 }
      : { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const },
  );

  return {
    ...carousel,
    currentSlide,
    reduceMotion,
    slideTransition,
    slideVariants,
    transitionDirection,
  };
}
