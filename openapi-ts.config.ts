import { defineConfig } from "@hey-api/openapi-ts";
import { defaultPlugins } from "@hey-api/openapi-ts";

export default defineConfig({
    input: "https://v4.goteo.org/v4/docs.json",
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
    ],
});
