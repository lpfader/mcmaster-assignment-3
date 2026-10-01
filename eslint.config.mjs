// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "build/**",
            "playwright-report/**",
            "test-results/**",
            ".eslintcache",

        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "no-console": "off",
            "prefer-const": "warn",
            eqeqeq: ["warn", "smart"],
        },
    },
    {
        files: ["**/*.mongodb.js", ".devcontainer/init/*.js"],
        languageOptions: {
            globals: {
                db: "writable",
                use: "readonly",
                print: "readonly",
                ObjectId: "readonly",
                ISODate: "readonly",
            },
        },
    },

    prettier,
);