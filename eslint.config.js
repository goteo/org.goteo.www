import pluginJs from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";
import cypressPlugin from "eslint-plugin-cypress";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "build/**",
            ".wrangler/**",
            "coverage/**",
            "public/**",
            "*.min.js",
            "eslint.config.js",
            ".astro/**",
            ".astro/**/*",
            "openapi/client/**",
            ".github/**",
            "env.d.ts",
        ],
    },
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            import: importPlugin,
            "unused-imports": unusedImportsPlugin,
        },
        rules: {
            "import/order": [
                "error",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        ["parent", "sibling", "index"],
                        "type",
                    ],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                },
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "unused-imports/no-unused-imports": "error",
        },
    },
    // Cypress configuration
    {
        files: ["cypress/**/*.{js,mjs,cjs,ts}"],
        plugins: {
            cypress: cypressPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                cy: "readonly",
                Cypress: "readonly",
                describe: "readonly",
                context: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                it: "readonly",
                expect: "readonly",
                assert: "readonly",
            },
        },
        rules: {
            ...cypressPlugin.configs.recommended.rules,
            "@typescript-eslint/no-unused-expressions": "off",
            "cypress/no-unnecessary-waiting": "off",
        },
    },
];
