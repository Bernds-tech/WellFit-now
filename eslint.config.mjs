import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["database/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: [
      "app/missionen/tagesmissionen/page.tsx",
      "components/admin/MissionEvidenceReviewQueue.tsx",
    ],
    rules: {
      // These screens intentionally synchronize remote client state during their
      // current Beta-1 load/error flow. Keep the finding visible without blocking
      // staging until that state flow is refactored into derived/async callbacks.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Firebase Functions are CommonJS/Node runtime files and are linted separately.
    "functions/**",
  ]),
]);

export default eslintConfig;
