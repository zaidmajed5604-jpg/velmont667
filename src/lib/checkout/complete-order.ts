import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOrderNumber } from "@/lib/utils/format";
import { getStripe } from "@/lib/stripe/server";

/**
 * Turns a succeeded Stripe PaymentIntent into a real order.
 *
 * Called from two places:
 *  1. src/app/api/webhooks/stripe/route.ts — the production path. Stripe
 *     calls this after payment succeeds, wherever the site is deployed.
 *  2. src/app/api/checkout/finalize/route.ts — a client-side fallback used
 *     right after `stripe.confirmPayment()` resolves. This exists because
 *     webhooks can't reach `localhost` without a tool like the Stripe CLI —
 *     it lets checkout complete end-to-end in local dev even without one.
 *
 * Both paths converge here and both call the idempotent `create_order`
 * Postgres function (see supabase/migrations/0006_order_idempotency.sql),
 * so it's safe if both happen to fire for the same payment.
 */
export async function completeOrderForPaymentIntent(paymentIntentId: string) {
  const admin = createAdminClient();

  // If an order already exists for this PaymentIntent, we're done —
  // return it rather than re-deriving anything.
  const { data: existingOrder } = await admin
    .from("orders")
    .select("id, order_number")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (existingOrder) {
    return { orderId: existingOrder.id, orderNumber: existingOrder.order_number, alreadyExisted: true };
  }

  // Confirm with Stripe directly rather than trusting the caller — this
  // function must never create an order for a payment that didn't
  // actually succeed.
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== "succeeded") {
    throw new Error(`PaymentIntent ${paymentIntentId} has not succeeded (status: ${paymentIntent.status}).`);
  }

  const { data: pending, error: pendingError } = await admin
    .from("pending_checkouts")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();

  if (pendingError || !pending) {
    throw new Error(`No pending checkout found for PaymentIntent ${paymentIntentId}.`);
  }

  const orderNumber = generateOrderNumber();
  const lines = pending.lines as { variantId: string; quantity: number }[];

  const { data: orderId, error: orderError } = await admin.rpc("create_order", {
    p_order_number: orderNumber,
    p_user_id: pending.user_id,
    p_email: pending.email,
    p_shipping_address: pending.shipping_address,
    p_billing_address: pending.billing_address,
    p_lines: lines.map((l) => ({ variant_id: l.variantId, quantity: l.quantity })),
    p_shipping_cents: pending.shipping_cents,
    p_tax_cents: pending.tax_cents,
    p_discount_cents: pending.discount_cents,
    p_coupon_code: pending.coupon_code,
    p_stripe_payment_intent_id: paymentIntentId,
  });

  if (orderError || !orderId) {
    throw new Error(`Failed to create order for PaymentIntent ${paymentIntentId}: ${orderError?.message}`);
  }

  // Clean up — the pending record has done its job.
  await admin.from("pending_checkouts").delete().eq("stripe_payment_intent_id", paymentIntentId);

  return { orderId, orderNumber, alreadyExisted: false };
}
