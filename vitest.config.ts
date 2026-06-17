import path from "path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "server-only": path.resolve(__dirname, "./src/test/mocks/server-only.ts"),
      },
    },
  };
});
