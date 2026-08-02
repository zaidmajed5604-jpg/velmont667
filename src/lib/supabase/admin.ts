import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service role key. This bypasses Row
 * Level Security entirely, so it must NEVER be imported into any file that
 * can end up in a Client Component bundle — the `server-only` import above
 * makes that a build-time error if it happens by accident.
 *
 * NOTE: deliberately untyped against the Database schema — see the comment
 * in src/lib/supabase/server.ts for why. Row shapes are documented via
 * src/lib/types/index.ts; cast query results to those where useful.
 *
 * Use this only for:
 *  - Checkout / order creation (needs to write orders regardless of RLS)
 *  - Webhook handlers (Stripe, etc.)
 *  - Admin dashboard mutations, after verifying the caller's role manually
 */
export function createAdminClient(): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
