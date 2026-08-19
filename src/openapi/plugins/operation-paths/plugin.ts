import { $ } from '@hey-api/openapi-ts';

import type { OperationPathsPlugin } from './types';

export const handler: OperationPathsPlugin['Handler'] = ({ plugin }) => {
    plugin.forEach('operation', (event) => {
        const symbolName = plugin.symbol(`${event.operation.id}Url`);
        const node = $.const(symbolName)
            .export()
            .assign($.literal(event.operation.path));
        plugin.node(node);
    });

};