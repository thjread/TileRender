import { defineConfig } from "vite";

export default defineConfig({
    build: {
        sourcemap: true,
    },
    optimizeDeps: {
        // wasm-pack output (file:../pkg) loads its .wasm relative to
        // import.meta.url, which dependency pre-bundling would break
        exclude: ["wasm-thjread"],
    },
});
