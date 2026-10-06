import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

const storageMessage =
  "Components must not touch localStorage — go through ApplicationService (constitution Principle V).";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "design", "test-results", "playwright-report", "coverage", "frontend"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-restricted-globals": ["error", { name: "localStorage", message: storageMessage }],
      "no-restricted-properties": [
        "error",
        { object: "window", property: "localStorage", message: storageMessage },
        { object: "globalThis", property: "localStorage", message: storageMessage },
      ],
    },
  },
  {
    files: ["src/services/LocalStorageService.ts", "src/**/*.test.{ts,tsx}", "src/test/**", "tests/**"],
    rules: { "no-restricted-globals": "off", "no-restricted-properties": "off" },
  },
  {
    files: ["*.config.{js,ts}", "tests/**"],
    languageOptions: { globals: { ...globals.node } },
  },
);
