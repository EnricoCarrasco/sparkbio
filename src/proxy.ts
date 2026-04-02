import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle /pt-BR locale prefix: rewrite to root path and pass locale via header
  if (pathname === "/pt-BR" || pathname.startsWith("/pt-BR/")) {
    const remainingPath = pathname === "/pt-BR" ? "/" : pathname.slice(6);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale-override", "pt-BR");

    const response = NextResponse.rewrite(new URL(remainingPath, request.url), {
      request: { headers: requestHeaders },
    });
    response.cookies.set("NEXT_LOCALE", "pt-BR", { path: "/" });
    return response;
  }

  // For all other routes: refresh Supabase auth session + handle auth redirects
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)" ],
};
