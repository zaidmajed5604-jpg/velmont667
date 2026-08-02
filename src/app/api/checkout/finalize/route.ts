import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { completeOrderForPaymentIntent } from "@/lib/checkout/complete-order";

const finalizeSchema = z.object({ paymentIntentId: z.string().min(1) });

/**
 * POST /api/checkout/finalize
 *
 * Called by the checkout page immediately after `stripe.confirmPayment()`
 * resolves successfully. This exists because Stripe webhooks can't reach
 * `localhost` without a forwarding tool (the Stripe CLI) — without this
 * route, checkout would appear to hang in local dev even though payment
 * succeeded.
 *
 * Safe to call even when a webhook ALSO fires for the same payment:
 * completeOrderForPaymentIntent is idempotent (see
 * src/lib/checkout/complete-order.ts and the unique index in
 * supabase/migrations/0006_order_idempotency.sql), so whichever of the two
 * runs first wins and the second just returns the same order.
 */
export async function POST(request: NextRequest) {
  const parsed = finalizeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
  }

  try {
    const { orderId, orderNumber } = await completeOrderForPaymentIntent(parsed.data.paymentIntentId);
    return NextResponse.json({ orderId, orderNumber });
  } catch (error) {
    console.error("[POST /api/checkout/finalize]", error);
    return NextResponse.json(
      { error: "We couldn't confirm your order yet. If you were charged, contact support with your payment reference." },
      { status: 409 },
    );
  }
}
