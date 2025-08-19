"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useRouter } from "next/navigation";
import { authErrorMessages } from "@/lib/auth-utils";

const AuthContext = createContext();

export function AuthProvider({ children, initialSession = null }) {
  const [user, setUser] = useState(initialSession?.user || null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!initialSession?.user
  );
  const [isLoading, setIsLoading] = useState(false); // Always start with false for SSR
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Separate loading for login
  const [isRegistering, setIsRegistering] = useState(false); // Separate loading for register
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Separate loading for logout
  const [error, setError] = useState(null);
  const router = useRouter();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkAuth = useCallback(async () => {
    // If we have initialSession, don't make additional requests
    if (initialSession !== null) {
      return;
    }

    // Only check if we don't have user data yet
    if (user) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (data.exito && data.isAuthenticated && data.usuario) {
        setUser(data.usuario);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [initialSession, user]);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      setError("Email and password are required");
      return { exito: false, error: "Email and password are required" };
    }

    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok && data.exito && data.usuario) {
        setUser(data.usuario);
        setIsAuthenticated(true);
        return { exito: true };
      } else {
        const errorMessage =
          data.error || authErrorMessages.INVALID_CREDENTIALS;
        setError(errorMessage);
        return { exito: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = authErrorMessages.NETWORK_ERROR;
      setError(errorMessage);
      return { exito: false, error: errorMessage };
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    if (!email || !password) {
      setError("Email and password are required");
      return { exito: false, error: "Email and password are required" };
    }

    setIsRegistering(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.exito) {
        // If auto-login after registration
        if (data.autoLogin && data.usuario) {
          setUser(data.usuario);
          setIsAuthenticated(true);
        }
        return {
          exito: true,
          autoLogin: data.autoLogin,
          mensaje: data.mensaje,
        };
      } else {
        const errorMessage = data.error || "Registration failed";
        setError(errorMessage);
        return { exito: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Register error:", error);
      const errorMessage = authErrorMessages.NETWORK_ERROR;
      setError(errorMessage);
      return { exito: false, error: errorMessage };
    } finally {
      setIsRegistering(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state immediately
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoggingOut(false);
      // Use replace instead of push to prevent back navigation
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    // Only run checkAuth if we don't have initial session data
    if (initialSession === null) {
      checkAuth();
    }
  }, [checkAuth, initialSession]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
