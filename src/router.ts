import { createRouter, createWebHashHistory } from "vue-router";

import ComponentSourceView from "./views/ComponentSourceView.vue";
import DashboardView from "./views/DashboardView.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: DashboardView },
    { path: "/components", component: ComponentSourceView },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
