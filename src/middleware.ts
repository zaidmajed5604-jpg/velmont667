import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs on every request (per the matcher below).
 *
 * Responsibilities:
 *  1. Refresh the Supabase auth session so server components always see a
 *     valid (non-expired) token.
 *  2. Gate /admin/** behind an authenticated staff/admin role.
 *  3. Apply a lightweight in-memory rate limit to /api/** as a baseline —
 *     swap `checkRateLimit` for the Upstash-backed version in
 *     src/lib/utils/rate-limit.ts once Redis is provisioned, since an
 *     in-memory counter does not survive across serverless instances.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // --- Admin route protection -------------------------------------------
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // --- Account route protection -------------------------------------------
  if (pathname.startsWith("/account") && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // --- Baseline rate limiting on API routes -------------------------------
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = checkRateLimit(ip, pathname);
    if (limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": "30" } },
      );
    }
  }

  return response;
}

// --- In-memory sliding-window limiter -------------------------------------
// Suitable for single-instance dev/small deployments. Replace with
// src/lib/utils/rate-limit.ts (Upstash) for multi-instance production.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const hits = new Map<string, number[]>();

function checkRateLimit(ip: string, path: string): boolean {
  const key = `${ip}:${path.split("/").slice(0, 3).join("/")}`;
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/api/:path*",
    /*
     * Match all request paths except static assets, so the auth session
     * cookie is kept fresh across normal page navigation too.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif)$).*)",
  ],
};
