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
      tailwindcss: {
        whitelist: [
          "^bg-(base|primary|secondary|accent|neutral|info|success|warning|error)(-.*)?$",
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
        ],
      },
    },
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      indent: ["error", 2],
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
