import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const ruleOverrides = {
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-require-imports": "warn",
};

const baseConfig = [...nextVitals, ...nextTs].map((config) => ({
  ...config,
  rules: {
    ...(config.rules ?? {}),
    ...ruleOverrides,
    ...((config.plugins && typeof config.plugins === "object" && "react" in config.plugins)
      ? { "react/no-unescaped-entities": "warn" }
      : {}),
  },
}));

const eslintConfig = defineConfig([
  ...baseConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    ".netlify/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
