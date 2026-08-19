import { definePluginConfig } from '@hey-api/openapi-ts';

import { handler } from './plugin';
import type { OperationPathsPlugin } from './types';

export const defaultConfig: OperationPathsPlugin['Config'] = {
    config: {},
    handler,
    name: 'operation-paths',
};

/**
 * Type helper for `operation-paths` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);