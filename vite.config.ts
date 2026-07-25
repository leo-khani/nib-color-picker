import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "chrome105",
    minify: "esbuild",
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/lib/testing/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["src/main.tsx", "src/**/*.test.ts", "src/**/*.test.tsx"],
    },
  },
});
