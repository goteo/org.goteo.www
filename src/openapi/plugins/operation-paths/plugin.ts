import type { Plugin } from '@hey-api/openapi-ts';

import type { Config } from './types';

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
    const file = context.createFile({
        id: plugin.name,
        path: plugin.output,
    });

    context.subscribe('operation', ({ operation }) => {
        const url = operation.path.replace(/{\w+}/g, (match) => `\${${match.slice(1, -1)}}`);
        const node = `export const ${operation.id}Url = '${url}';`;

        file.add(node);
    });
};
