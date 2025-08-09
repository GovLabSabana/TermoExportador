import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/unauthorized"];
const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES_PATTERN = /^\/(?!(_next|api|favicon\.ico))/;
const normalizePath = (path) => path.replace(/\/+$/, ""); // quita slash final

function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
}

async function verifyToken(token) {
  try {
    // Basic token format validation
    if (!token || !token.includes(".") || token.split(".").length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      return { valid: false, error: "Token expired" };
    }

    // For now, we'll consider it valid if it's not expired
    // In the future, you might want to verify the signature with the actual Supabase secret
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export async function middleware(request) {
  const pathname = normalizePath(request.nextUrl.pathname);
  const token = request.cookies.get("auth_token")?.value;

  // Improved logging with short token
  const shortToken = token ? token.substring(0, 20) + "..." : "undefined";
  console.log(`Middleware: ${pathname}, token: ${shortToken}`);

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Handle protected routes
  if (!isPublic && PROTECTED_ROUTES_PATTERN.test(pathname)) {
    if (!token) {
      console.log("No token found, redirecting to unauthorized");
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const verifyResult = await verifyToken(token);
    console.log(
      "Token verification result:",
      verifyResult.valid,
      verifyResult.error
    );

    if (!verifyResult.valid) {
      console.log("Invalid token, redirecting and clearing cookies");
      const response = NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
      response.cookies.delete("auth_token", { path: "/" });
      response.cookies.delete("refresh_token", { path: "/" });
      return response;
    }

    console.log("Token valid, allowing access to protected route");
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const verifyResult = await verifyToken(token);
    console.log("Auth route with token, verification:", verifyResult.valid);

    if (verifyResult.valid) {
      console.log("Valid token on auth page, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      console.log("Invalid token on auth page, clearing cookies");
      // Clear invalid token
      const response = NextResponse.next();
      response.cookies.delete("auth_token", { path: "/" });
      response.cookies.delete("refresh_token", { path: "/" });
      return response;
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
