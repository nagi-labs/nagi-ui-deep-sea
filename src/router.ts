import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";

import ButtonContractView from "./views/ButtonContractView.vue";
import ComboboxContractView from "./views/ComboboxContractView.vue";
import CarouselContractView from "./views/CarouselContractView.vue";
import DashboardView from "./views/DashboardView.vue";
import DialogContractView from "./views/DialogContractView.vue";
import ToastContractView from "./views/ToastContractView.vue";

const routes = [
  { path: "/", component: DashboardView },
  { path: "/components", component: () => import("./views/ComponentSourceView.vue") },
  { path: "/button-contract", component: ButtonContractView },
  { path: "/carousel-contract", component: CarouselContractView },
  { path: "/combobox-contract", component: ComboboxContractView },
  { path: "/dialog-contract", component: DialogContractView },
  { path: "/toast-contract", component: ToastContractView },
];

export function createAppRouter(server = false) {
  return createRouter({
    history: server
      ? createMemoryHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({ top: 0 }),
  });
}
