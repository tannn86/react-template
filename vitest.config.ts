/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import "@testing-library/jest-dom";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["**/*.test.tsx"],
  },
});
