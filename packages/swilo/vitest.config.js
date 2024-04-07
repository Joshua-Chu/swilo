/// <reference types="vitest" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  css: { postcss: { plugins: [] } },
  test: {
    environment: "happy-dom",
    // uncomment this if we need setups
    // setupFiles: "./tests/setup.unit.ts",
    include: ["./app/**/*.test.{ts,tsx}"],
    exclude: ["./app/**/integration/*.test.{ts,tsx}"],
  },
});
