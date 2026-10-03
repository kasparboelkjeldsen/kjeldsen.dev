import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const outDir = resolve(__dirname, "../Umbraco.Bench.Umbraco/wwwroot/dist");

export default defineConfig({
    // *.ce.vue components compile in custom-element mode: their <style> blocks are
    // inlined into the element's shadow root. Site-wide styling is Tailwind: site.css
    // scans both Razor views and Vue components (see @source in src/site.css).
    plugins: [vue(), tailwindcss()],
    build: {
        outDir,
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "src/main.ts"),
                site: resolve(__dirname, "src/site.css"),
            },
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name].js",
                assetFileNames: "[name][extname]",
            },
        },
    },
});
