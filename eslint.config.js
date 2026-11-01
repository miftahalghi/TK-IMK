import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist", "node_modules", "docs/**/*.html"] },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-uses-vars": "error",
      "react/jsx-key": "error",
      "react/jsx-no-target-blank": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // Aturan batas fitur (CONTRACT.md §3): fitur hanya mengimpor dari "@shared",
    // dari file di foldernya sendiri, atau dari package yang sudah terpasang.
    files: ["src/features/*/**/*.{js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@shared/*"], message: 'Impor dari "@shared" saja (CONTRACT.md §3).' },
            { group: ["../*", "!./*"], message: 'Fitur tidak boleh mengimpor dari luar foldernya. Pakai "@shared" (CONTRACT.md §3).' },
          ],
        },
      ],
    },
  },
  {
    // Context, barrel, dan definisi fitur memang mengekspor komponen + hook/konstanta.
    files: ["src/shared/**", "src/features/*/index.js", "src/features/registry.js"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["scripts/**", "*.config.js", "**/*.test.{js,jsx,mjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
];
