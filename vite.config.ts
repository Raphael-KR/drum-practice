import { defineConfig } from "vite";
import ko from "./src/locales/ko.json";
export default defineConfig({
  optimizeDeps: {entries: ["index.html"]},
  plugins: [
    {
      name: "localized-document-title",
      transformIndexHtml(html) {
        return html.replace("%APP_TITLE%", ko["main.message097"]);
      },
    },
  ],
});
