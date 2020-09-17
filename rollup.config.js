import ts from "rollup-plugin-typescript2";

const base = {
    input: "src/index.ts",
};

const esm = {
    ...base,
    output: {
        format: "esm",
        dir: "esm",
        sourcemap: true,
    },
    plugins: [ts({ clean: true })],
};

const cjs = {
    ...base,
    output: {
        format: "cjs",
        dir: "cjs",
        sourcemap: true,
    },
    plugins: [ts()],
};

const usm = {
    ...base,
    output: {
        format: "umd",
        dir: "umd",
        sourcemap: true,
        name: "CrankRedux",
    },
    plugins: [ts()],
};

const config = [esm, cjs, usm];

export default config;