import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: "build",
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,
    assetsInlineLimit: 4096,
    manifest: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
