import { env } from "$env/dynamic/private";

import type { CreateClientConfig } from "./client/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: env.API_URL,
});
