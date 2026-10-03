import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const outDir = resolve(__dirname, "../Umbraco.Bench.Umbraco/App_Plugins/umbraco.bench.extensions");

export default defineConfig({
    plugins: [
        {
            name: "copy-umbraco-manifest",
            writeBundle() {
                copyFileSync(
                    resolve(__dirname, "public/umbraco-package.json"),
                    resolve(outDir, "umbraco-package.json")
                );
            },
        },
    ],
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "dist",
        },
        outDir,
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
});
