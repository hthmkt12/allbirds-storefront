import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  // payload-cms runs its own Next.js build; keep the root config storefront-only
  // so nested builds don't adopt these rules while walking up the tree.
  { ignores: ["dist", "coverage", "payload-cms"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      // Drawer components intentionally reset state in effects on open/close
      // (account, search, listing filters); restructuring them is out of scope.
      "react-hooks/set-state-in-effect": "off",
      // The CMS client intentionally parses untyped Payload REST payloads.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
