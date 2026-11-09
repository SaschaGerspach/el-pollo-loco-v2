import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // File change events from a Windows bind mount do not reach the container.
    watch: { usePolling: true },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
