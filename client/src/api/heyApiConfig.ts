import type { CreateClientConfig } from "./generated/client.gen";
import { API_BASE_URL } from "./config";

/**
 * Custom configuration hook consumed by the generated `client.gen.ts` at
 * runtime (wired via `runtimeConfigPath` in `openapi-ts.config.ts`).
 *
 * This file is NOT generated: regenerating the API client only rewrites the
 * `generated/` folder, so this configuration survives `npm run generate:api`.
 */
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseURL: API_BASE_URL,
  withCredentials: true,
});