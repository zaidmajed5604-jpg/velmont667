import "server-only";
import Stripe from "stripe";

/**
 * Server-only Stripe client. Never import this into a Client Component —
 * the `server-only` guard above makes that a build-time error if it
 * happens by accident, since it holds the secret key.
 */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.example.",
    );
  }
  return new Stripe(key, {
apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}
