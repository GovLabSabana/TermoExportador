"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { useCookieSync } from "@/hooks/useCookieSync";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,
  error: null,
  logout: () => {},
  checkAuthStatus: () => {},
  clearError: () => {},
  isLoggingOut: false,
});

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  const { logout, isLoggingOut } = useLogout();
  const [isInitialized, setIsInitialized] = useState(false);

  // Use cookie sync hook to monitor cookie changes
  useCookieSync();

  useEffect(() => {
    // Wait for store hydration before initializing
    if (auth.isHydrated && !isInitialized) {
      setIsInitialized(true);
    }
  }, [auth.isHydrated, isInitialized]);

  const contextValue = {
    ...auth,
    // Override logout with enhanced version
    logout,
    isLoggingOut,
    // Show loading until both store is hydrated and auth is initialized
    // But reduce loading time for better UX
    isLoading: auth.isLoading || (!auth.isHydrated && !isInitialized),
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
