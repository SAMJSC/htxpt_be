module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
    },
    plugins: [
        "@typescript-eslint/eslint-plugin",
        "simple-import-sort",
        "import",
    ],
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:prettier/recommended",
        "eslint:recommended",
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: [".eslintrc.js", "ormconfig.ts"],
    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": ["error"],
        "prettier/prettier": ["error", {
            "endOfLine": "auto"
        }],
        "spaced-comment": "off",
        "no-console": "warn",
        "consistent-return": "off",
        "func-names": "off",
        "object-shorthand": "off",
        "no-process-exit": "off",
        "no-param-reassign": "off",
        "no-return-await": "off",
        "no-underscore-dangle": "off",
        "class-methods-use-this": "off",
        "prefer-destructuring": ["error", { object: true, array: false }],
        "no-unused-vars": ["error", { argsIgnorePattern: "req|res|next|val" }],
        "import/no-unresolved": ["warn", { ignore: ["^@hrdrone/*"] }],
        "simple-import-sort/imports": "warn",
        "simple-import-sort/exports": "warn",
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true, // this loads <rootdir>/tsconfig.json to eslint
            },
        },
    },
};
