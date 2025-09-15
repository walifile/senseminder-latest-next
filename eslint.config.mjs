// @ts-nocheck
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

// ----------------------------------------------------------------------

/**
 * @rules common
 * from 'react', 'eslint-plugin-react-hooks'...
 */
const commonRules = () => ({
  ...reactHooksPlugin.configs.recommended.rules,
  "func-names": 1,
  "no-bitwise": 2,
  "no-unused-vars": 0,
  "object-shorthand": 1,
  "no-useless-rename": 1,
  "default-case-last": 2,
  "consistent-return": 2,
  "no-constant-condition": 1,
  "default-case": [2, { commentPattern: "^no default$" }],
  "lines-around-directive": [2, { before: "always", after: "always" }],
  "arrow-body-style": [
    2,
    "as-needed",
    { requireReturnForObjectLiteral: false },
  ],
  // react
  "react/jsx-key": 0,
  "react/prop-types": 0,
  "react/display-name": 0,
  "react/no-children-prop": 0,
  "react/jsx-boolean-value": 2,
  "react/self-closing-comp": 2,
  "react/react-in-jsx-scope": 0,
  "react/jsx-no-useless-fragment": [1, { allowExpressions: true }],
  "react/jsx-curly-brace-presence": [2, { props: "never", children: "never" }],
  "react/no-unescaped-entities": "off",
  // typescript
  // "@typescript-eslint/no-shadow": 2,
  "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: false }],
  "@typescript-eslint/no-empty-object-type": 0,
  "@typescript-eslint/consistent-type-imports": 1,
  "@typescript-eslint/no-unused-vars": [2, { args: "none" }], // Changed to 2 to disallow unused variables
  "@typescript-eslint/ban-ts-comment": "off",
});

/**
 * @rules import
 * from 'eslint-plugin-import'.
 */
const importRules = () => ({
  ...importPlugin.configs.recommended.rules,
  "import/named": 0,
  "import/export": 0,
  "import/default": 0,
  "import/namespace": 0,
  "import/no-named-as-default": 0,
  "import/newline-after-import": 2,
  "import/no-named-as-default-member": 0,
  "import/no-cycle": [
    0, // disabled if slow
    {
      maxDepth: "∞",
      ignoreExternal: false,
      allowUnsafeDynamicCyclicDependency: false,
    },
  ],
});

/**
 * @rules unused imports
 * from 'eslint-plugin-unused-imports'.
 */
const unusedImportsRules = () => ({
  "unused-imports/no-unused-imports": 1,
  "unused-imports/no-unused-vars": [
    2, // Changed to 2 to disallow unused variables
    {
      vars: "all",
      varsIgnorePattern: "^_",
      args: "after-used",
      argsIgnorePattern: "^_",
    },
  ],
});

/**
 * @rules sort or imports/exports
 * from 'eslint-plugin-perfectionist'.
 */
const sortImportsRules = () => {
  const customGroups = {
    radix: ["custom-radix"],
    shadcn: ["custom-shadcn"],
    aws: ["custom-aws"],
    redux: ["custom-redux"],
    stripe: ["custom-stripe"],
    forms: ["custom-forms"],
    ui: ["custom-ui"],
    auth: ["custom-auth"],
    hooks: ["custom-hooks"],
    utils: ["custom-utils"],
    types: ["custom-types"],
    api: ["custom-api"],
    components: ["custom-components"],
    providers: ["custom-providers"],
    context: ["custom-context"],
    guards: ["custom-guards"],
    middleware: ["custom-middleware"],
    constants: ["custom-constants"],
    config: ["custom-config"],
    styles: ["custom-styles"],
  };

  return {
    "perfectionist/sort-named-imports": [
      1,
      { type: "line-length", order: "asc" },
    ],
    "perfectionist/sort-named-exports": [
      1,
      { type: "line-length", order: "asc" },
    ],
    "perfectionist/sort-exports": [
      1,
      {
        order: "asc",
        type: "line-length",
        groupKind: "values-first",
      },
    ],
    "perfectionist/sort-imports": [
      2,
      {
        order: "asc",
        ignoreCase: true,
        type: "line-length",
        environment: "node",
        maxLineLength: undefined,
        newlinesBetween: "always",
        internalPattern: ["^src/.+"],
        groups: [
          "style",
          "side-effect",
          "type",
          ["builtin", "external"],
          customGroups.radix,
          customGroups.shadcn,
          customGroups.aws,
          customGroups.redux,
          customGroups.stripe,
          customGroups.forms,
          customGroups.ui,
          customGroups.auth,
          customGroups.hooks,
          customGroups.utils,
          customGroups.types,
          customGroups.api,
          "internal",
          customGroups.components,
          customGroups.providers,
          customGroups.context,
          customGroups.guards,
          customGroups.middleware,
          customGroups.constants,
          customGroups.config,
          customGroups.styles,
          ["parent", "sibling", "index"],
          ["parent-type", "sibling-type", "index-type"],
          "object",
          "unknown",
        ],
        customGroups: {
          value: {
            [customGroups.radix]: ["^@radix-ui/.+"],
            [customGroups.shadcn]: ["^@/components/ui/.+", "^@/lib/utils"],
            [customGroups.aws]: [
              "^@aws-amplify/.+",
              "^@aws-sdk/.+",
              "^aws-amplify",
            ],
            [customGroups.redux]: [
              "^@reduxjs/.+",
              "^react-redux",
              "^redux-persist",
            ],
            [customGroups.stripe]: ["^@stripe/.+", "^stripe"],
            [customGroups.forms]: ["^react-hook-form", "^@hookform/.+", "^zod"],
            [customGroups.ui]: [
              "^framer-motion",
              "^lucide-react",
              "^react-icons",
              "^sonner",
              "^next-themes",
              "^clsx",
              "^tailwind-merge",
              "^class-variance-authority",
              "^cmdk",
              "^vaul",
              "^input-otp",
              "^embla-carousel",
              "^react-resizable-panels",
              "^react-day-picker",
              "^react-clock",
              "^react-time-picker",
              "^react-qr-code",
              "^react-toastify",
              "^recharts",
              "^date-fns",
              "^axios",
              "^zustand",
              "^ua-parser-js",
              "^cookies-next",
            ],
            [customGroups.auth]: ["^src/auth/.+", "^src/guards/.+"],
            [customGroups.hooks]: ["^src/hooks/.+", "^@/hooks/.+"],
            [customGroups.utils]: ["^src/lib/.+", "^@/lib/.+"],
            [customGroups.types]: ["^src/types/.+", "^@/types/.+"],
            [customGroups.api]: ["^src/api/.+"],
            [customGroups.components]: [
              "^src/components/.+",
              "^@/components/.+",
            ],
            [customGroups.providers]: ["^src/providers/.+"],
            [customGroups.context]: ["^src/context/.+"],
            [customGroups.guards]: ["^src/guards/.+"],
            [customGroups.middleware]: ["^src/middleware/.+"],
            [customGroups.constants]: ["^src/constants/.+"],
            [customGroups.config]: ["^src/config/.+"],
            [customGroups.styles]: ["^src/styles/.+"],
          },
        },
      },
    ],
  };
};

/**
 * Custom ESLint configuration.
 */
const customConfig = {
  plugins: {
    "react-hooks": reactHooksPlugin,
    "unused-imports": unusedImportsPlugin,
    perfectionist: perfectionistPlugin,
    import: importPlugin,
  },
  settings: {
    // https://www.npmjs.com/package/eslint-import-resolver-typescript
    ...importPlugin.configs.typescript.settings,
    "import/resolver": {
      ...importPlugin.configs.typescript.settings["import/resolver"],
      typescript: {
        project: "./tsconfig.json",
      },
    },
    react: { version: "detect" },
  },
  rules: {
    ...commonRules(),
    ...importRules(),
    ...unusedImportsRules(),
    ...sortImportsRules(),
  },
};

// ----------------------------------------------------------------------

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    ignores: [
      "*",
      "!src/",
      "!eslint.config.*",
      "!next.config.*",
      "!tailwind.config.*",
      "!postcss.config.*",
    ],
  },
  {
    languageOptions: {
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        // Node globals
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
  },
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommended,
  reactPlugin.configs.flat.recommended,
  customConfig,
  // Specific rules for API files to enforce centralized environment variable usage
  {
    files: ["src/api/**/*.{ts,tsx}"],
    ignores: ["src/api/apiConfig.ts"],
    rules: {
      "no-restricted-syntax": [
        2,
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Use centralized apiConfig instead of direct process.env access. Import from '@/api/apiConfig' or '@/api/apiUtils'",
        },
        {
          selector:
            "MemberExpression[object.object.name='process'][property.name='env']",
          message:
            "Use centralized apiConfig instead of direct process.env access. Import from '@/api/apiConfig' or '@/api/apiUtils'",
        },
      ],
    },
  },
];
