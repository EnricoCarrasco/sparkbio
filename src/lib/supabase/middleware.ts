import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Helper: NextResponse.redirect() returns a fresh response that doesn't
  // carry the Set-Cookie headers Supabase queued on supabaseResponse during
  // a token refresh. If we don't copy them, the browser follows the redirect
  // with stale cookies, the refresh token gets consumed twice, and the user
  // ends up bounced to /login. Always route redirects through this helper.
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const redirectResponse = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  };

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !user) {
    return redirectTo("/login");
  }

  // Redirect authenticated users away from auth pages and marketing homepage
  if (
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/" ||
      pathname === "/pt-BR") &&
    user
  ) {
    return redirectTo("/dashboard");
  }

  return supabaseResponse;
}
