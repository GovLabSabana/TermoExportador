import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { toast } from "react-toastify";

export const useLogout = () => {
  const router = useRouter();
  const { logout: logoutStore, setLoading } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(
    async (options = {}) => {
      const { redirectTo = "/login", showNotification = true } = options;

      if (isLoggingOut) return; // Prevent multiple logout calls

      setIsLoggingOut(true);
      setLoading(true);

      try {
        console.log("🚪 Starting enhanced logout process...");

        let backendResponse = null;

        // Perform the actual logout (calls POST /auth/logout and clears frontend data)
        const logoutResult = await authApi.logout();

        if (logoutResult.success) {
          console.log("✅ Logout process successful");
          backendResponse = logoutResult.backendResponse;

          if (backendResponse) {
            console.log("🔥 Backend logout successful:", backendResponse);
          }

          if (showNotification && typeof window !== "undefined") {
            // Show a brief success message (you could replace this with a toast library)
            toast.success("Sesión cerrada correctamente", {
              autoClose: 1000,
            });
          }
        } else {
          console.log("⚠️ Logout had issues:", logoutResult.error);
        }

        // Clear store state
        logoutStore();

        // Additional cleanup
        if (typeof window !== "undefined") {
          // Clear any additional data you might want to remove
          try {
            // Clear sessionStorage
            sessionStorage.clear();
            console.log("🗑️ SessionStorage cleared");

            // You could also clear specific localStorage items here
            const itemsToRemove = [
              "user-preferences",
              "temp-data",
              "draft-forms",
              // Add any other items you want to clear on logout
            ];

            itemsToRemove.forEach((item) => {
              try {
                localStorage.removeItem(item);
              } catch (e) {
                console.warn(`Could not remove ${item} from localStorage:`, e);
              }
            });
          } catch (error) {
            console.error("Error during additional cleanup:", error);
          }
        }

        console.log("🔄 Redirecting to:", redirectTo);

        // Small delay to ensure all cleanup is complete
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);

        return {
          success: true,
          backendResponse,
          message: "Logout completed successfully",
        };
      } catch (error) {
        console.error("❌ Logout error:", error);

        // Even if there's an error, clear everything and redirect
        logoutStore();

        if (typeof window !== "undefined") {
          try {
            sessionStorage.clear();
            localStorage.removeItem("termoexportador-auth");
          } catch (cleanupError) {
            console.error("Error during error cleanup:", cleanupError);
          }
        }

        // Still redirect even on error
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);

        return {
          success: false,
          error: error.message,
          message: "Logout completed with errors",
        };
      } finally {
        setLoading(false);
        setIsLoggingOut(false);
      }
    },
    [router, logoutStore, setLoading, isLoggingOut]
  );

  return {
    logout,
    isLoggingOut,
  };
};
