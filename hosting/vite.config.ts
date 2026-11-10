import { defineConfig, type UserConfig } from "vite";
import { sites } from "./build/sites-vite-plugin.ts";
export default defineConfig(async (): Promise<UserConfig> => {
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    publicDir: false,
    plugins: [
      sites({ mockAuth: false }),
      cloudflare({
        viteEnvironment: { name: "server" },
        inspectorPort: false,
        config: {
          name: "drum-practice",
          main: "./server/player-worker.ts",
          compatibility_date: "2026-05-15",
          compatibility_flags: ["nodejs_compat"],
          assets: {
            binding: "ASSETS",
            run_worker_first: true,
            html_handling: "none",
          },
        },
      }),
    ],
  };
});
