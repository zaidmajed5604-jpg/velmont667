import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs on every request.
 *
 * Responsibilities:
 * 1. Refresh Supabase auth session.
 * 2. Protect /admin routes.
 * 3. Protect /account routes.
 * 4. Apply basic API rate limiting.
 */

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },

        set(
          name: string,
          value: string,
          options: {
            path?: string;
            maxAge?: number;
            expires?: Date;
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: "lax" | "strict" | "none";
          },
        ) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },

        remove(
          name: string,
          options: {
            path?: string;
          },
        ) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Admin protection
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

  // Account protection
  if (pathname.startsWith("/account") && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // API rate limit
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const limited = checkRateLimit(ip, pathname);

    if (limited) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again shortly.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "30",
          },
        },
      );
    }
  }

  return response;
}


// Simple in-memory rate limiter
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

const hits = new Map<string, number[]>();

function checkRateLimit(ip: string, path: string): boolean {
  const key = `${ip}:${path.split("/").slice(0, 3).join("/")}`;

  const now = Date.now();

  const timestamps = (hits.get(key) ?? []).filter(
    (time) => now - time < WINDOW_MS,
  );

  timestamps.push(now);

  hits.set(key, timestamps);

  return timestamps.length > MAX_REQUESTS;
}


export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif)$).*)",
  ],
};