import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
          options: Record<string, unknown>,
        ) {
          response.cookies.set({
            name,
            value,
            ...(options as object),
          });
        },

        remove(
          name: string,
          options: Record<string, unknown>,
        ) {
          response.cookies.set({
            name,
            value: "",
            ...(options as object),
            maxAge: 0,
          });
        },
      },
    },
  );

  // أكمل باقي الكود كما هو...
}