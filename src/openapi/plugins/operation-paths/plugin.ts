import type { Config } from "./types";
import type { Plugin } from "@hey-api/openapi-ts";

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
    const file = context.createFile({
        id: plugin.name,
        path: plugin.output,
    });

    context.subscribe("operation", ({ operation }) => {
        const node = `export const ${operation.id}Url = '${operation.path}';`;

        file.add(node);
    });
};
