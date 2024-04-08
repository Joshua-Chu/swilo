// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  ignorePatterns: ["www/**", "packages/**"],
  extends: ["@swilo/eslint-config/library.js"],
  parser: "@typescript-eslint/parser",
  plugins: ["import"],
  parserOptions: {
    project: true,
  },
  rules: {
    // turn on errors for missing imports
    "import/no-unresolved": "error",
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: ["tsconfig.json", "package/tsconfig.json"],
      },
      node: {
        project: ["tsconfig.json", "package/tsconfig.json"],
      },
    },
  },
};
