import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStore, type StoredUser } from "./tokenStore";
import { postApiUsersLogout } from "../api/api";

interface Session {
  user: StoredUser;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (session: Session) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(() => tokenStore.getUser());

  useEffect(() => tokenStore.subscribe(() => setUser(tokenStore.getUser())), []);

  useEffect(() => {
    const onAuthExpired = () => {
      setUser(null);
      if (window.location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("auth:expired", onAuthExpired);
    return () => window.removeEventListener("auth:expired", onAuthExpired);
  }, [navigate]);

  const login = (session: Session): void => {
    tokenStore.setSession(session);
  };

  const logout = async (): Promise<void> => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) {
        await postApiUsersLogout({ body: { refreshToken } });
      }
    } finally {
      tokenStore.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isAdmin: user?.role === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}