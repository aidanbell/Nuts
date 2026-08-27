import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginReactRefresh from "eslint-plugin-react-refresh";
/**
 * ESLint config.
 *
 * Consuming project needs:
 *   npm i -D eslint typescript typescript-eslint @eslint/js eslint-config-prettier
 */
export default defineConfig(
  globalIgnores(["dist/**", "build/**", "coverage/**", ".next/**"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginReactHooks.configs.recommended,
  eslintPluginReactRefresh.configs.recommended,
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
      // js rules
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      // typescript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  eslintConfigPrettier,
);
