export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

const ACCESS_TOKEN_KEY = "ecommerce.accessToken";
const REFRESH_TOKEN_KEY = "ecommerce.refreshToken";
const USER_KEY = "ecommerce.user";

type Listener = () => void;

const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

function readUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUser;
    if (!parsed || typeof parsed !== "object" || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Plain module-level token store shared by the Axios interceptors and the
 * React auth context. Keeping it dependency-free avoids import cycles and
 * lets the HTTP layer survive API-client regeneration untouched.
 */
export const tokenStore = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  getUser(): StoredUser | null {
    return readUser();
  },
  setSession(session: { user: StoredUser; accessToken: string; refreshToken: string }): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    notify();
  },
  setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    notify();
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notify();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};