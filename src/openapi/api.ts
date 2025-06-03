import type { CreateClientConfig } from "./client/client.gen";

export function getBaseUrl() {
    if (typeof import.meta !== "undefined" && import.meta.env) {
        if (import.meta.env.PUBLIC_API_URL) {
            return import.meta.env.PUBLIC_API_URL;
        }
    } else if (typeof process !== "undefined" && process.env) {
        if (process.env.PUBLIC_API_URL) {
            return process.env.PUBLIC_API_URL;
        }
    }

    return "https://v4.goteo.org";
}

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: getBaseUrl(),
});
