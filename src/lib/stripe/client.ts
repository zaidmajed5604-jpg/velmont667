"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/** Loads Stripe.js once and reuses the same promise on every call — avoids re-fetching the script per render. */
export function getStripeClient() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Add it to .env.local — see .env.example.",
      );
    }
    stripePromise = loadStripe(key ?? "");
  }
  return stripePromise;
}
