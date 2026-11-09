import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["dist"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["scripts/**/*.js"],
    languageOptions: { globals: { console: "readonly" } },
  },
  {
    // Unit tests import these modules in Node, where Phaser and browser globals do not exist.
    files: ["src/logic/**/*.ts", "src/config/**/*.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        { paths: [{ name: "phaser", allowTypeImports: true }] },
      ],
      "no-restricted-globals": [
        "error",
        "window",
        "document",
        "localStorage",
        "navigator",
        "location",
      ],
    },
  },
  prettier,
);
