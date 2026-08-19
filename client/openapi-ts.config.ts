import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../server/openapi/openapi.json",
  output: "src/api/generated",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "@hey-api/client-axios",
      runtimeConfigPath: "./src/api/heyApiConfig",
    },
  ],
});