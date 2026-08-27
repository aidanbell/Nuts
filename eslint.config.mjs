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
  eslintPluginReactRefresh.configs.recommended,
  {
    plugins: {
      "react-hooks": eslintPluginReactHooks,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
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
      "prefer-const": "error",
      "no-var": "error",
      // typescript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  eslintConfigPrettier,
);
