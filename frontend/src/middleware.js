import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/unauthorized"];
// Routes that redirect to dashboard if authenticated (auth-only routes)
const authOnlyRoutes = ["/login", "/register"];

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  console.log(`Middleware: ${pathname}`);

  // Check authentication status from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const isAuthenticated = !!accessToken;

  // If route is public, allow access
  if (publicRoutes.includes(pathname)) {
    // But redirect authenticated users away from auth-only routes
    if (authOnlyRoutes.includes(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL("/unauthorized", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
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
