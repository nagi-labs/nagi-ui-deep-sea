import { nagiStyleCompiler } from "@nagi-labs/nagi-ui/style-compiler";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  css: {
    postcss: {
      plugins: [nagiStyleCompiler()],
    },
  },
  plugins: [vue()],
});
