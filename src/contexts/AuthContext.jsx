import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import {
  getCurrentSession,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from "../services/auth-service";
import { clearSession, sessionStorageKeys } from "../lib/token-storage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const session = getCurrentSession();

      if (!session.refreshToken) {
        if (mounted) setStatus("anonymous");
        return;
      }

      try {
        const refreshedSession = await refreshUserSession();
        const nextUser = refreshedSession.user || session.user;

        if (!nextUser) {
          throw new Error("No user was returned for the active session.");
        }

        if (mounted) {
          setUser(nextUser);
          setStatus("authenticated");
        }
      } catch {
        clearSession();
        if (mounted) {
          setUser(null);
          setStatus("anonymous");
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleStorage(event) {
      if (
        event.key === sessionStorageKeys.refreshToken &&
        event.newValue === null
      ) {
        setUser(null);
        setStatus("anonymous");
      }

      if (event.key === sessionStorageKeys.user && event.newValue) {
        try {
          setUser(JSON.parse(event.newValue));
        } catch {
          // Ignore malformed cross-tab storage events.
        }
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback(async (credentials) => {
    const session = await loginUser(credentials);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const register = useCallback(async (details) => {
    const session = await registerUser(details);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
    }),
    [login, logout, register, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
