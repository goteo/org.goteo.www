import pluginJs from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";
import cypressPlugin from "eslint-plugin-cypress";
import sveltePlugin from "eslint-plugin-svelte";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import svelteConfig from "./svelte.config.js";
import svelteParser from "svelte-eslint-parser";

/** @type {import('eslint').Linter.Config[]} */
export default [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...sveltePlugin.configs.recommended,
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.browser } },
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
            "src/openapi/client/**",
            ".github/**",
            "env.d.ts",
        ],
    },
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
    // Svelte configuration
    {
        files: ["**/*.svelte"],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                projectService: true,
                extraFileExtensions: [".svelte"],
                parser: tseslint.parser,
                svelteConfig,
            },
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
            "no-unsafe-finally": "off",
            "unused-imports/no-unused-imports": "error",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
            "svelte/require-each-key": "off",
            "svelte/no-at-html-tags": "off",
            "svelte/prefer-writable-derived": "off",
            "svelte/prefer-svelte-reactivity": "off",
            "svelte/no-unused-props": "warn",
        },
    },
];
