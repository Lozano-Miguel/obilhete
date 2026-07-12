import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    // Dummy keys so modules that instantiate SDK clients at import time load in tests.
    env: {
      GROQ_API_KEY: "test-groq-key",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
