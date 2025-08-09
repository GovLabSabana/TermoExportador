import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { cookieUtils, isTokenExpired, getUserFromToken } from "@/lib/cookies";

export const useAuth = () => {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isHydrated,
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
    login: loginStore,
    logout: logoutStore,
    syncWithCookies,
    hydrate,
  } = useAuthStore();

  // Check and sync authentication state
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);

    try {
      const cookieToken = cookieUtils.getToken();

      // If no cookie token, ensure we're logged out
      if (!cookieToken) {
        if (isAuthenticated) {
          logoutStore();
        }
        setLoading(false);
        return false;
      }

      // Check if token is expired
      if (isTokenExpired(cookieToken)) {
        // Try to refresh token
        const refreshResult = await authApi.refreshToken();

        if (!refreshResult.success) {
          logoutStore();
          setLoading(false);
          return false;
        }

        loginStore(refreshResult.user, refreshResult.token);
        setLoading(false);
        return true;
      }

      // Token exists and is valid, but we might not have user data
      if (!user || token !== cookieToken) {
        try {
          // Try to verify token and get user data
          const verifyResult = await authApi.verifyToken(cookieToken);

          if (verifyResult.success && verifyResult.user) {
            loginStore(verifyResult.user, cookieToken);
          } else {
            // If verification fails, try to extract user from token payload
            const userFromToken = getUserFromToken(cookieToken);
            if (userFromToken) {
              loginStore(userFromToken, cookieToken);
            } else {
              logoutStore();
              setLoading(false);
              return false;
            }
          }
        } catch (error) {
          console.error("Token verification error:", error);
          // If verification fails, logout
          logoutStore();
          setLoading(false);
          return false;
        }
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      setLoading(false);
      return false;
    }
  }, [user, token, isAuthenticated, loginStore, logoutStore, setLoading]);

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('Starting logout process...');
      
      // Call the enhanced logout API method (includes /auth/me call)
      const logoutResult = await authApi.logout();
      
      if (logoutResult.success) {
        console.log('API logout successful:', logoutResult.message);
        if (logoutResult.userData) {
          console.log('User data retrieved during logout:', logoutResult.userData);
        }
      } else {
        console.log('API logout error:', logoutResult.error);
      }
      
      // Clear store state
      logoutStore();
      
      // Clear localStorage completely (in addition to cookies)
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('termoexportador-auth');
          console.log('LocalStorage cleared');
        } catch (error) {
          console.error('Error clearing localStorage:', error);
        }
      }
      
      console.log('Logout process completed, redirecting to login...');
      
      // Redirect to login page
      router.push('/login');
      
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if there's an error, clear everything and redirect
      logoutStore();
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('termoexportador-auth');
        } catch (lsError) {
          console.error('Error clearing localStorage during error handling:', lsError);
        }
      }
      
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [logoutStore, setLoading, router]);

  const refreshAuth = useCallback(async () => {
    const refreshResult = await authApi.refreshToken();

    if (refreshResult.success) {
      loginStore(refreshResult.user, refreshResult.token);
      return true;
    }

    logoutStore();
    return false;
  }, [loginStore, logoutStore]);

  // Initial hydration and auth check
  useEffect(() => {
    if (isHydrated) {
      checkAuthStatus();
    }
  }, [isHydrated, checkAuthStatus]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isHydrated,
    logout,
    checkAuthStatus,
    refreshAuth,
    clearError,
    setError,
  };
};
