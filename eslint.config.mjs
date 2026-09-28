import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Flat ESLint config.
 *
 * eslint-config-next v16+ ships a native flat config, so the legacy
 * FlatCompat wrapper is no longer needed (and breaks on it).
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      ".dfx/**",
      "node_modules/**",
      "coverage/**",
    ],
  },
  ...nextCoreWebVitals,
];

export default eslintConfig;
