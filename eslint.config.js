import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  { 
    files: ["**/*.{js,mjs,cjs,jsx}"], 
    languageOptions: { 
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
  js.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/prop-types": "off", // Disable prop-types since we're not using them consistently
      "no-unused-vars": ["warn", { 
        "varsIgnorePattern": "^[A-Z]", // Allow unused uppercase variables (components)
        "argsIgnorePattern": "^_"
      }]
    }
  }
];
