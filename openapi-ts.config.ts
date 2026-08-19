// This config runs in Node, outside Astro, so nothing has loaded `.env` yet. It must come
// before the import below: `consts.ts` reads the environment as it is evaluated.
import "dotenv/config";

import { defineConfig } from "@hey-api/openapi-ts";
import { defaultPlugins } from "@hey-api/openapi-ts";

import { defineConfig as operationPathsConfig } from "./src/openapi/plugins/operation-paths";
import { getBaseUrl, getApiVersion } from "./src/utils/consts";

export default defineConfig({
    input: `${getBaseUrl()}/${getApiVersion()}/docs.json`,
    output: "src/openapi/client",
    plugins: [
        ...defaultPlugins,
        operationPathsConfig(),
        {
            name: "@hey-api/client-fetch",
            runtimeConfigPath: "./src/openapi/api.ts",
        },
        {
            name: "@hey-api/sdk",
        },
        {
            name: "@hey-api/typescript",
            enums: "javascript",
        },
        {
            name: "zod",
            requests: true
        }
    ],
    parser: {
        transforms: {
            readWrite: {
                enabled: false,
            },
        },
    },
});
