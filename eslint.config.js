import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import stylistic from '@stylistic/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  reactPlugin.configs.flat.recommended,
  reactHooks.configs.flat.recommended,
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      'indent': ['error', 2],
      '@stylistic/indent': ['error', 2],
      "react/self-closing-comp": "error",
      "react/react-in-jsx-scope": "off",
      "react/no-multi-comp": ["error", { ignoreStateless: false }],
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
