import type { InternalAxiosRequestConfig } from "axios";
import { client } from "./generated/client.gen";
import { postApiUsersLogout, postApiUsersRefreshToken } from "./generated/sdk.gen";
import { tokenStore } from "../auth/tokenStore";

/**
 * Custom authentication layer for the generated API client.
 *
 * This file is NOT generated: regenerating the API client only rewrites the
 * `generated/` folder, so this interceptor setup survives `npm run generate:api`.
 */

const AUTH_EXEMPT_PATTERNS = [
  /\/api\/users\/login$/,
  /\/api\/users\/register$/,
  /\/api\/users\/refresh-token$/,
  /\/api\/users\/logout$/,
];

const isAuthExempt = (url?: string): boolean =>
  !!url && AUTH_EXEMPT_PATTERNS.some((pattern) => pattern.test(url));

/** Single in-flight refresh promise — concurrent 401s share one refresh call. */
let refreshing: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const result = await postApiUsersRefreshToken({
        body: { refreshToken },
      });
      if (result.error || !result.data) {
        await postApiUsersLogout({ body: { refreshToken } }).catch(() => undefined);
        return false;
      }
      const { data } = result.data;
      tokenStore.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return true;
    } catch {
      await postApiUsersLogout({ body: { refreshToken } }).catch(() => undefined);
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

client.instance.interceptors.request.use((config) => {
  if (isAuthExempt(config.url)) {
    config.headers.delete("Authorization");
    return config;
  }
  const accessToken = tokenStore.getAccessToken();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    config.headers.delete("Authorization");
  }
  return config;
});

client.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !original || original._retry || isAuthExempt(original.url)) {
      return Promise.reject(error);
    }

    original._retry = true;

    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return client.instance(original);
    }

    tokenStore.clear();
    window.dispatchEvent(new CustomEvent("auth:expired"));
    return Promise.reject(error);
  }
);

export { client };
export default client;