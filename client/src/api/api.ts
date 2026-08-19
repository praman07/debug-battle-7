/**
 * Public API surface for the application.
 *
 * Re-exports the generated SDK + types (from `generated/`) and the configured
 * client (from `httpClient.ts`). Application code should import from here —
 * never directly from `generated/` — so custom configuration can never be
 * bypassed and regenerating the client keeps working.
 */
export * from "./generated/sdk.gen";
export * from "./generated/types.gen";
export { client } from "./httpClient";