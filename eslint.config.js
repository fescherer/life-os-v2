import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import stylistic from "@stylistic/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import tailwind from "eslint-plugin-tailwindcss";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  reactPlugin.configs.flat.recommended,
  reactHooks.configs.flat.recommended,
  ...tailwind.configs["flat/recommended"],

  {
    settings: {
      react: {
        version: "detect",
      },
      tailwindcss: {
        whitelist: [
          "^bg-(base|primary|secondary|accent|neutral|info|success|warning|error)(-.*)?$",
          "border-(base|primary|secondary|accent|neutral|info|success|warning|error)(-.*)?$",
          "text-(base|primary|secondary|accent|neutral|info|success|warning|error)(-.*)?$",
          "^bg-(background|foreground|card|popover|muted|accent|secondary|primary|destructive|sidebar|input)(/.*)?$",
          "^border-(border|input|ring|destructive|sidebar|sidebar-border)(/.*)?$",
          "^text-(foreground|card-foreground|popover-foreground|muted-foreground|accent-foreground|secondary-foreground|primary-foreground|destructive|sidebar-foreground|sidebar-accent-foreground|sidebar-primary-foreground)(/.*)?$",
          "^tooltip(-.*)?$",
          "^btn(-.*)?$",
          "^card(-.*)?$",
          "^menu(-.*)?$",
          "^alert(-.*)?$",
          "^badge(-.*)?$",
          "^modal(-.*)?$",
          "^drawer(-.*)?$",
          "^navbar(-.*)?$",
          "^hero(-.*)?$",
          "^footer(-.*)?$",
          "^input(-.*)?$",
          "^select(-.*)?$",
          "^textarea(-.*)?$",
          "^toggle(-.*)?$",
          "^collapse(-.*)?$",
          "^tabs(-.*)?$",
          "^tab(-.*)?$",
          "^table(-.*)?$",
          "^divider(-.*)?$",
          "^avatar(-.*)?$",
          "^dropdown(-.*)?$",
          "^stat(-.*)?$",
          "^steps(-.*)?$",
          "^join(-.*)?$",
          "^mockup(-.*)?$",
          "^rounded(-.*)?$",
          "^label(-.*)?$",
          "^form-control(-.*)?$",
          "^animate(-.*)?$",
        ],
      },
    },
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "indent": "off",
      "@stylistic/indent": ["error", 2],
      "react/self-closing-comp": "error",
      "react/react-in-jsx-scope": "off",
      "react/no-multi-comp": ["error", { ignoreStateless: false }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "tailwindcss/no-custom-classname": "error",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
