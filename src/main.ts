import { createApp, createSSRApp } from "vue";

import App from "./App.vue";
import { createAppRouter } from "./router";
import "@nagi-labs/nagi-ui/recipes/unovis/theme.css";
import "./theme/deep-sea.css";

const container = document.querySelector("#app");
const app = container?.hasChildNodes() ? createSSRApp(App) : createApp(App);
const router = createAppRouter();

app.use(router);
router.isReady().then(() => app.mount("#app"));
