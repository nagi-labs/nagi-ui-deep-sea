import { createApp } from "vue";

import App from "./App.vue";
import { router } from "./router";
import "@nagi-labs/nagi-ui/recipes/unovis/theme.css";
import "./theme/deep-sea.css";
import "./style.css";

createApp(App).use(router).mount("#app");
