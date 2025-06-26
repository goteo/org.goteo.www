import { getBaseUrl } from "../utils/consts";

import type { CreateClientConfig } from "./client/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: getBaseUrl(),
});
