import { PUBLIC_API_URL } from "$env/static/public";
import type { CreateClientConfig } from "./client/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: PUBLIC_API_URL,
});
