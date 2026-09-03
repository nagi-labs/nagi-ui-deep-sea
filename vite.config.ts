import { nagiStyleCompiler } from "@nagi-labs/nagi-ui/style-compiler";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import packageMetadata from "./package.json" with { type: "json" };

export default defineConfig({
  define: {
    __DEEP_SEA_VERSION__: JSON.stringify(packageMetadata.version),
  },
  css: {
    postcss: {
      plugins: [nagiStyleCompiler()],
    },
  },
  plugins: [vue()],
});
