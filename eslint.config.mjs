import js from "@eslint/js";
import globals from "globals";

export default [
  // 1. Apply core recommended rules to all JS targets
  js.configs.recommended,

  // 2. Custom configuration workspace overrides
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // Recommended if you handle packages/imports
      },
    },
    rules: {
      "no-undef": "error", // Explicitly throws errors on non-existing variables
      "no-unused-vars": "warn", // Flags packages imported but never used
    },
  },

  // 3. Specific override for legacy CommonJS files
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
];
