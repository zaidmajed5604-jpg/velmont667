import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { checkoutSchema, cartItemSchema } from "@/lib/validations/schemas";
import { FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_SHIPPING_CENTS } from "@/lib/constants";
import { rateLimit } from "@/lib/utils/rate-limit";
import { z } from "zod";

const requestSchema = z.object({
  checkout: checkoutSchema,
  lines: z.array(cartItemSchema).min(1, "Your bag is empty."),
});

/**
 * POST /api/checkout/create-intent
 *
 * Step 1 of checkout: re-price the cart server-side, validate/apply a
 * coupon, create a Stripe PaymentIntent for the exact total, and stash the
 * checkout payload (shipping address, cart lines, etc.) in
 * `pending_checkouts` keyed by the PaymentIntent id — Stripe metadata is
 * too small to hold a full cart. Returns a client_secret for the frontend
 * to confirm with `stripe.confirmPayment()`.
 *
 * The order itself is NOT created here — it's created from the pending
 * checkout row once payment actually succeeds (webhook or the local-dev
 * fallback route), so nothing ships or decrements stock for money that
 * was never collected.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`checkout:${ip}`, { limit: 10, windowSeconds: 60 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid checkout data." }, { status: 400 });
  }
  const { checkout, lines } = parsed.data;

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Re-price every line server-side (never trust client totals) --------
  const variantIds = lines.map((l) => l.variantId);
  const { data: variants, error: variantsError } = await admin
    .from("product_variants")
    .select("id, stock_quantity, product_id, products(price_cents)")
    .in("id", variantIds);

  if (variantsError || !variants || variants.length !== variantIds.length) {
    return NextResponse.json({ error: "One or more items are no longer available." }, { status: 400 });
  }

  let subtotalCents = 0;
  for (const line of lines) {
    const variant = variants.find((v) => v.id === line.variantId);
    const product = variant?.products as unknown as { price_cents: number } | null;
    if (!variant || !product) {
      return NextResponse.json({ error: "One or more items are no longer available." }, { status: 400 });
    }
    if (variant.stock_quantity < line.quantity) {
      return NextResponse.json(
        { error: `Only ${variant.stock_quantity} left in stock for one of your items.` },
        { status: 409 },
      );
    }
    subtotalCents += product.price_cents * line.quantity;
  }

  // --- Coupon validation ----------------------------------------------------
  let discountCents = 0;
  let shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
  const couponCode = checkout.couponCode?.trim().toUpperCase() || null;

  if (couponCode) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", couponCode)
      .eq("is_active", true)
      .single();

    const validCoupon =
      coupon &&
      subtotalCents >= coupon.min_subtotal_cents &&
      (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
      (!coupon.max_redemptions || coupon.times_redeemed < coupon.max_redemptions);

    if (!validCoupon) {
      return NextResponse.json({ error: "This coupon code is invalid or has expired." }, { status: 400 });
    }

    if (coupon.type === "percentage" && coupon.percentage) {
      discountCents = Math.round((subtotalCents * coupon.percentage) / 100);
    } else if (coupon.type === "fixed_amount" && coupon.value_cents) {
      discountCents = Math.min(coupon.value_cents, subtotalCents);
    } else if (coupon.type === "free_shipping") {
      shippingCents = 0;
    }
  }

  // Simplified flat-rate tax — replace with a destination-based tax
  // provider (Stripe Tax, TaxJar, Avalara) before going live.
  const taxCents = 0;
  const totalCents = subtotalCents + shippingCents + taxCents - discountCents;

  if (totalCents < 50) {
    // Stripe requires a minimum charge (50 cents USD) — a heavily
    // discounted order could dip below that.
    return NextResponse.json({ error: "Order total is too low to process." }, { status: 400 });
  }

  const billingAddress = checkout.billingAddressSameAsShipping
    ? checkout.shippingAddress
    : (checkout.billingAddress ?? checkout.shippingAddress);

  // --- Create the PaymentIntent ---------------------------------------------
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: "usd",
    receipt_email: checkout.email,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: user?.id ?? "guest" },
  });

  // --- Stash the full checkout payload, keyed by the PaymentIntent --------
  const { error: pendingError } = await admin.from("pending_checkouts").insert({
    stripe_payment_intent_id: paymentIntent.id,
    email: checkout.email,
    shipping_address: checkout.shippingAddress,
    billing_address: billingAddress,
    lines,
    shipping_cents: shippingCents,
    tax_cents: taxCents,
    discount_cents: discountCents,
    coupon_code: couponCode,
    user_id: user?.id ?? null,
  });

  if (pendingError) {
    console.error("[POST /api/checkout/create-intent]", pendingError);
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => undefined);
    return NextResponse.json({ error: "Failed to start checkout. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    totalCents,
  });
}
