import { defineConfig } from "vite";
import ko from "./src/locales/ko.json";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
export default defineConfig(({ mode }) => {
  const separate = mode === "editor" || mode === "player";
  return {
    optimizeDeps: { entries: ["index.html", "editor.html", "player.html"] },
    ...(separate
      ? {
          publicDir: false,
          base: "./",
          build: {
            outDir: `dist/${mode}`,
            rollupOptions: { input: `${mode}.html` },
          },
        }
      : {}),
    plugins: [
      {
        name: "localized-document-title",
        transformIndexHtml(html) {
          return html.replace("%APP_TITLE%", ko["main.message097"]);
        },
      },
      {
        name: "app-boundary-evidence",
        generateBundle(_, bundle) {
          if (!separate) return;
          if (mode === "editor")
            this.emitFile({
              type: "asset",
              fileName: "portable-template.html",
              source: readFileSync("public/portable-template.html"),
            });
          if (mode === "player") {
            const scores = JSON.parse(
              readFileSync("src/bundled-scores.json", "utf8"),
            );
            for (const score of scores)
              this.emitFile({
                type: "asset",
                fileName: score.file,
                source: readFileSync(`public/${score.file}`),
              });
          }
          const modules = Object.values(bundle).flatMap((chunk) =>
            chunk.type === "chunk" ? Object.keys(chunk.modules) : [],
          );
          mkdirSync("docs/experiments/editor-player-separation", {
            recursive: true,
          });
          writeFileSync(
            `docs/experiments/editor-player-separation/${mode}-modules.json`,
            JSON.stringify(modules, null, 2),
          );
        },
      },
    ],
  };
});
