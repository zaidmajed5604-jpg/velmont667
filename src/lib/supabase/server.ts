import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes the auth cookie via Next's cookies() API
 * so sessions persist across requests without any client-side token storage.
 *
 * NOTE: deliberately untyped against the Database schema (no <Database>
 * generic). The hand-authored types in database.types.ts don't perfectly
 * match every structural constraint Supabase's generic client expects
 * across versions, which was causing query results to silently resolve to
 * `never` at compile time — a worse outcome than just not type-checking
 * column names. Row shapes are still documented via the types in
 * src/lib/types/index.ts; cast query results to those where useful.
 * To restore full type-checking, run `npm run db:types` against a real
 * Supabase project to generate verified types, then reintroduce
 * `<Database>` here once that's confirmed to compile cleanly.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component with no request context to
            // mutate — safe to ignore because middleware refreshes the
            // session on every navigation anyway.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // See note above.
          }
        },
      },
    },
  );
}
