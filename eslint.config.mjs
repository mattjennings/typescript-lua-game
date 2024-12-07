// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "prefer-const": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      // important for lua
      "@typescript-eslint/no-use-before-define": "error",
    },
  }
)