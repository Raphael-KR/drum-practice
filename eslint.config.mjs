import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/.wrangler/**",
    "**/.sites-runtime/**",
    ".tmp/**",
    "src/generated/**",
    "public/**",
    "data/**",
    "deployment/**",
    "dependencies/**",
    "local-archives/**",
    "local-libraries/**",
    "docs/experiments/**",
  ]),
  {
    files: ["**/*.{js,mjs,ts}"],
    extends: [js.configs.recommended],
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["src/**/*-worker.ts"],
    languageOptions: { globals: globals.worker },
  },
  {
    files: [
      "*.{ts,mjs}",
      "scripts/**/*.mjs",
      "tools/**/*.mjs",
      "server/**/*.ts",
      "hosting/**/*.{ts,mjs}",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    // These Node.js tools also run browser callbacks through page.evaluate().
    files: ["tools/score-production/musicxml/*.mjs"],
    languageOptions: { globals: globals.browser },
  },
  // Formatting belongs to Prettier; keep this last to avoid conflicting rules.
  prettier,
);
