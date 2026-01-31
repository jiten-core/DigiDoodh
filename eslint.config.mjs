import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            // Allow unused vars starting with underscore
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }],
            // Allow any type (for flexibility)
            "@typescript-eslint/no-explicit-any": "off",
            // Allow empty catch blocks
            "no-empty": ["error", { allowEmptyCatch: true }],
            // React rules
            "react-hooks/exhaustive-deps": "warn",
            "react/no-unescaped-entities": "off",
        },
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "dist/**",
            "electron-app/**",
            "public/**",
        ],
    },
];

export default eslintConfig;
