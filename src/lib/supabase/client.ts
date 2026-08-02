"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Uses the anon key only — safe to expose.
 * Row Level Security policies (see supabase/migrations/0001_init.sql) are
 * the actual authorization boundary; this client never bypasses them.
 *
 * NOTE: deliberately untyped against the Database schema — see the comment
 * in src/lib/supabase/server.ts for why.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
