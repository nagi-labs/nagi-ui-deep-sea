import { onBeforeUnmount, onMounted, readonly, ref } from "vue";

export function useUserReducedMotion() {
  const reduced = ref(false);
  let query: MediaQueryList | undefined;

  function syncPreference(event?: MediaQueryListEvent) {
    reduced.value = event?.matches ?? query?.matches ?? false;
  }

  onMounted(() => {
    query = window.matchMedia("(prefers-reduced-motion: reduce)");
    syncPreference();
    query.addEventListener("change", syncPreference);
  });

  onBeforeUnmount(() => query?.removeEventListener("change", syncPreference));

  return readonly(reduced);
}
