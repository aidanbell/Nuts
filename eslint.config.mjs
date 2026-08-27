import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginSolid from "eslint-plugin-solid";

/**
 * ESLint config for SolidJS + TypeScript.
 */
export default defineConfig(
  globalIgnores(["dist/**", "build/**", "coverage/**", ".next/**"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginSolid.configs["flat/typescript"],
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "error",
      "no-var": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  eslintConfigPrettier,
);
