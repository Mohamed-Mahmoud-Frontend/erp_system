import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * proxy.ts — Next.js 16 route guard
 *
 * Runs before every matched request. Uses Supabase's cookie-based session
 * to decide whether the user is authenticated.
 *
 * Rules:
 *  - Any path under /dashboard with no valid session → redirect to /login
 *  - /login with a valid session → redirect to /dashboard
 *  - Everything else → pass through
 *
 * IMPORTANT: This is an optimistic check (reads the cookie without a DB round-trip).
 * Each Server Action and Server Component must ALSO verify the session independently
 * via `createClient()` from lib/supabase/server.ts — never rely solely on this proxy.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/api/health") return NextResponse.next();

  // Build a response we can mutate (needed for Supabase cookie refresh)
  let response = NextResponse.next({
    request,
  });

  // Create a Supabase client that reads/writes cookies on the request/response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          // Write refreshed auth cookies onto both the forwarded request
          // and the outgoing response so the browser & server stay in sync.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() is the recommended call for proxy — it validates the JWT locally
  // without a network round-trip to Supabase Auth servers.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname === "/login";

  // Unauthenticated user trying to reach a protected route → send to /login
  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting /login → send them into the dashboard
  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all paths EXCEPT:
     * - _next/static  (static build assets)
     * - _next/image   (image optimisation API)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files (logos, images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
