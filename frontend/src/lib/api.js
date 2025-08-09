import { cookieUtils, isTokenExpired } from "./cookies";

const API_BASE_URL = "https://merry-courage-production.up.railway.app";

export class ApiError extends Error {
  constructor(message, status, response = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = cookieUtils.getToken();

    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token && !isTokenExpired(token)) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.detail || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new ApiError("Network error. Please check your connection.", 0);
      }

      throw new ApiError(error.message || "An unexpected error occurred", 500);
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "GET",
      ...options,
    });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "DELETE",
      ...options,
    });
  }
}

export const apiClient = new ApiClient();

export const authApi = {
  async register(email, password) {
    try {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
      });

      return {
        success: true,
        data: response,
        user: response.usuario,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      };
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      if (response.success && response.access_token) {
        cookieUtils.setToken(response.access_token);
      }

      return {
        success: true,
        data: response,
        user: response.user,
        token: response.access_token,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      };
    }
  },

  async logout() {
    try {
      // Get current token before removing it
      const currentToken = cookieUtils.getToken();

      // Call POST /auth/logout to logout from backend
      let logoutResponse = null;
      if (currentToken) {
        try {
          console.log("Calling POST /auth/logout to logout from backend...");
          logoutResponse = await apiClient.post("/auth/logout", {});
          console.log("Backend logout successful:", logoutResponse);
        } catch (error) {
          console.log("Error calling POST /auth/logout:", error.message);
          // Continue with frontend logout even if backend logout fails
        }
      }

      // Remove token and clear cookies after backend logout
      cookieUtils.removeToken();

      return {
        success: true,
        message: "Logged out successfully",
        backendResponse: logoutResponse,
      };
    } catch (error) {
      // Still remove token even if there's an error
      cookieUtils.removeToken();

      return {
        success: false,
        error: error.message,
      };
    }
  },

  async verifyToken(token) {
    try {
      const response = await apiClient.get("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        user: response.user,
        valid: true,
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.message,
      };
    }
  },

  async refreshToken() {
    try {
      const refreshToken = cookieUtils.getRefreshToken();

      if (!refreshToken) {
        throw new ApiError("No refresh token available", 401);
      }

      const response = await apiClient.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      if (response.access_token) {
        cookieUtils.setToken(response.access_token);
      }

      return {
        success: true,
        token: response.access_token,
        user: response.user,
      };
    } catch (error) {
      cookieUtils.removeToken();
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get("/auth/me");

      return {
        success: true,
        user: response,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      };
    }
  },
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};
