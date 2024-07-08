import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [vue(), dts({ rollupTypes: true })],
  plugins: [vue()],
  build: {
    target: "modules",
    lib: {
      entry: "src/index.ts",
      name: "player-comp",
      formats: ["es"],
      // the name of the output files when the build is run
      fileName: "index",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
