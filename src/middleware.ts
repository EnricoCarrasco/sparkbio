import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip i18n middleware for API routes and auth callback
  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/callback")) {
    return updateSession(request);
  }

  // Skip i18n middleware for public profile pages (/{username})
  // Profile usernames: lowercase alphanumeric + hyphens, 3-30 chars
  const isProfilePage =
    /^\/[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(pathname) &&
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/register") &&
    !pathname.startsWith("/forgot-password") &&
    !pathname.startsWith("/reset-password");

  if (isProfilePage) {
    return updateSession(request);
  }

  // For all other routes, run both i18n and Supabase session middleware
  const supabaseResponse = await updateSession(request);

  // If Supabase middleware redirected, return that redirect
  if (supabaseResponse.headers.get("location")) {
    return supabaseResponse;
  }

  // Run i18n middleware
  const intlResponse = intlMiddleware(request);

  // Copy Supabase cookies to i18n response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
