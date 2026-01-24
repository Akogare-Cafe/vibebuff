import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactCompiler from "eslint-plugin-react-compiler";

// Deep filter to remove react-compiler from all nested configs
const removeReactCompiler = (configs) => {
  return configs.map(config => {
    const newConfig = { ...config };
    
    // Remove react-compiler rules
    if (newConfig.rules) {
      const newRules = { ...newConfig.rules };
      delete newRules["react-compiler/react-compiler"];
      delete newRules["react-hooks/preserve-manual-memoization"];
      newConfig.rules = newRules;
    }
    
    // Remove react-compiler plugin
    if (newConfig.plugins && newConfig.plugins["react-compiler"]) {
      const newPlugins = { ...newConfig.plugins };
      delete newPlugins["react-compiler"];
      newConfig.plugins = newPlugins;
    }
    
    return newConfig;
  });
};

const eslintConfig = defineConfig([
  ...removeReactCompiler(nextVitals),
  ...removeReactCompiler(nextTs),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      // Downgrade TypeScript rules to warnings
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-empty-object-type": "warn",
      // Downgrade React rules to warnings
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",
      // Downgrade other rules to warnings
      "prefer-const": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      // Disable react-compiler globally
      "react-compiler/react-compiler": "off",
    },
  },
]);

export default eslintConfig;
