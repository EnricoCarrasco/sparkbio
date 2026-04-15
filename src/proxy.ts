import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function setGeoCookie(response: NextResponse, request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  if (country) {
    response.cookies.set("geo-country", country, {
      path: "/",
      httpOnly: false,
      maxAge: 86400,
    });
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Refresh Supabase auth session + handle auth redirects for every app route.
  // updateSession knows to redirect authenticated users away from "/" and "/pt-BR".
  const authResponse = await updateSession(request);
  if (authResponse.headers.get("location")) {
    return setGeoCookie(authResponse, request);
  }

  // Handle /pt-BR locale prefix: rewrite to root path and pass locale via header
  if (pathname === "/pt-BR" || pathname.startsWith("/pt-BR/")) {
    const remainingPath = pathname === "/pt-BR" ? "/" : pathname.slice(6);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale-override", "pt-BR");

    const response = NextResponse.rewrite(new URL(remainingPath, request.url), {
      request: { headers: requestHeaders },
    });
    response.cookies.set("NEXT_LOCALE", "pt-BR", { path: "/" });
    return setGeoCookie(response, request);
  }

  return setGeoCookie(authResponse, request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)" ],
};
