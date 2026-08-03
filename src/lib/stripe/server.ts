import "server-only";
import Stripe from "stripe";

/**
 * Server-only Stripe client. Never import this into a Client Component —
 * the `server-only` guard above makes that a build-time error if it
 * happens by accident, since it holds the secret key.
 *
 * Deliberately does NOT pin `apiVersion` — the Stripe SDK's TypeScript
 * types hardcode the latest API version as a string literal type, which
 * breaks the build on every SDK update that ships a newer default (as
 * happened here). Omitting it falls back to your Stripe account's
 * configured default API version instead, which is stable across SDK
 * upgrades. Set a specific version in the Stripe Dashboard if you need to
 * pin one deliberately.
 */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.example.",
    );
  }
  return new Stripe(key, {
    typescript: true,
  });
}
