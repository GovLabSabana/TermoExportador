import { NextRequest, NextResponse } from "next/server";
import {
  setAuthCookies,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/server-auth";
import {
  validateEmail,
  validatePassword,
  authErrorMessages,
} from "@/lib/auth-utils";

const API_BASE_URL = "https://merry-courage-production.up.railway.app";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return createErrorResponse("Email and password are required");
    }

    if (!validateEmail(email)) {
      return createErrorResponse("Invalid email format");
    }

    if (!validatePassword(password)) {
      return createErrorResponse("Password must be at least 6 characters");
    }

    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "PostmanRuntime/7.36.0",
      },

      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();
    if (data.exito) {
      // Set httpOnly cookies
      await setAuthCookies(data.access_token, data.usuario);

      return createSuccessResponse({
        exito: true,
        mensaje: "Login successful",
        usuario: data.usuario,
      });
    } else {
      const errorMessage =
        data.message || data.detail || authErrorMessages.INVALID_CREDENTIALS;

      return createErrorResponse(errorMessage, response.status || 401);
    }
  } catch (error) {
    console.error("Login API error:", error);
    return createErrorResponse(authErrorMessages.NETWORK_ERROR, 500);
  }
}
