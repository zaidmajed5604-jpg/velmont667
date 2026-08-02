"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";

interface PaymentFormProps {
  totalCents: number;
}

/**
 * Renders Stripe's PaymentElement (card + wallets, whatever's enabled on
 * the Stripe account) and drives the confirm → finalize → redirect flow.
 *
 * `redirect: "if_required"` keeps the shopper on this page for payment
 * methods that don't need an off-site redirect (most cards); methods like
 * some bank redirects will still navigate away and come back via
 * `return_url`, which is why that's also set below.
 */
export default function PaymentForm({ totalCents }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please check your details and try again.");
      setSubmitting(false);
      return;
    }

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      setErrorMessage("Payment did not complete. Please try again.");
      setSubmitting(false);
      return;
    }

    // Payment succeeded on Stripe's side — turn it into a real order.
    // In production the webhook (src/app/api/webhooks/stripe/route.ts) does
    // this too; completeOrderForPaymentIntent is idempotent, so calling it
    // from both places is safe. This client-side call is what lets
    // checkout finish immediately in local dev even without the Stripe
    // CLI forwarding webhooks.
    try {
      const res = await fetch("/api/checkout/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Payment succeeded but order creation hasn't caught up yet (e.g.
        // a slow webhook race) — this is recoverable, not a failure.
        toast.info("Payment received — confirming your order…");
        router.push(`/account/orders?pendingPayment=${paymentIntent.id}`);
        return;
      }

      clearCart();
      toast.success(`Order ${data.orderNumber} confirmed.`);
      router.push(`/account/orders?justPlaced=${data.orderNumber}`);
    } catch {
      toast.info("Payment received — confirming your order…");
      router.push(`/account/orders?pendingPayment=${paymentIntent.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      {errorMessage && <p className="font-sans text-sm text-error">{errorMessage}</p>}
      <Button type="submit" size="lg" isLoading={submitting} disabled={!stripe} className="w-full">
        Pay {formatPrice(totalCents)}
      </Button>
      <p className="text-center font-sans text-xs text-ink-muted">
        Payments are processed securely by Stripe. VELMONT never sees your card details.
      </p>
    </form>
  );
}
