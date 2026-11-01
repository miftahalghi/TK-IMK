import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fitur hanya boleh mengimpor dari "@shared" (lihat CONTRACT.md §3).
      "@shared": fileURLToPath(new URL("./src/shared/index.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx}", "scripts/**/*.test.mjs"],
    setupFiles: ["./src/test-setup.js"],
  },
});
