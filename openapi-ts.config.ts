import { defineConfig } from "@hey-api/openapi-ts";
import { defaultPlugins } from "@hey-api/openapi-ts";

import { defineConfig as operationPathsConfig } from "./src/openapi/plugins/operation-paths";

export default defineConfig({
    input: "http://localhost:8090/v4/docs.json",
    output: "src/openapi/client",
    plugins: [
        ...defaultPlugins,
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
            readOnlyWriteOnlyBehavior: "off",
        },
        operationPathsConfig(),
    ],
});
