import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe/server";
import { completeOrderForPaymentIntent } from "@/lib/checkout/complete-order";
import type Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 *
 * The production order-completion path: Stripe calls this endpoint
 * whenever a payment's status changes. We only act on
 * `payment_intent.succeeded` — that's the signal that money has actually
 * moved, which is the only safe moment to create an order and decrement
 * stock.
 *
 * Local development: Stripe can't reach `localhost` directly. Forward
 * events to this route with the Stripe CLI:
 *
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * which prints a `whsec_...` value — put that in STRIPE_WEBHOOK_SECRET in
 * .env.local. Without the CLI running, checkout still completes locally
 * via the client-side fallback in /api/checkout/finalize; this route is
 * what takes over once the site is actually deployed.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set — rejecting request.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    // Verifying the signature is what proves this request actually came
    // from Stripe and wasn't forged — never skip this.
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe webhook] Signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      try {
        const result = await completeOrderForPaymentIntent(paymentIntent.id);
        console.info(`[stripe webhook] Order ${result.orderNumber} confirmed for ${paymentIntent.id}.`);
      } catch (error) {
        console.error(`[stripe webhook] Failed to complete order for ${paymentIntent.id}:`, error);
        // Return a 500 so Stripe retries — a transient DB hiccup shouldn't
        // silently lose an order for a payment that already succeeded.
        return NextResponse.json({ error: "Failed to process payment." }, { status: 500 });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.warn(`[stripe webhook] Payment failed for ${paymentIntent.id}.`);
      break;
    }

    default:
      // Other event types aren't relevant to order creation — ignored.
      break;
  }

  return NextResponse.json({ received: true });
}
