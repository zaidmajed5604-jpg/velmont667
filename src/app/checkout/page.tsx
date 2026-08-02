"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { checkoutSchema } from "@/lib/validations/schemas";
import { formatPrice } from "@/lib/utils/format";
import { FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_SHIPPING_CENTS, COUNTRIES } from "@/lib/constants";
import Button from "@/components/ui/button";
import StripeProvider from "@/components/checkout/stripe-provider";
import PaymentForm from "@/components/checkout/payment-form";
import { toast } from "sonner";

type Step = "details" | "payment";

export default function CheckoutPage() {
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotalCents());
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [totalCents, setTotalCents] = useState(0);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });

  const shippingCents = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
  const estimatedTotal = subtotal + shippingCents;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();

    const checkoutPayload = {
      email: form.email,
      shippingAddress: {
        label: "Shipping",
        fullName: form.fullName,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state || undefined,
        postalCode: form.postalCode,
        country: form.country,
        phone: form.phone || undefined,
      },
      billingAddressSameAsShipping: true,
      couponCode: couponCode || undefined,
    };

    const parsed = checkoutSchema.safeParse(checkoutPayload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout: parsed.data,
          lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setClientSecret(data.clientSecret);
      setTotalCents(data.totalCents);
      setStep("payment");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-luxury flex min-h-[50vh] flex-col items-center justify-center gap-4 pt-32 text-center">
        <p className="font-sans text-base text-ink-muted">Your bag is empty.</p>
        <Button onClick={() => router.push("/shop")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container-luxury pb-section-sm pt-32">
      <h1 className="mb-4 font-display text-display-lg font-normal text-ink">Checkout</h1>
      <div className="mb-12 flex items-center gap-3 font-sans text-xs uppercase tracking-widest2 text-ink-muted">
        <span className={step === "details" ? "text-ink" : ""}>1. Details</span>
        <span>—</span>
        <span className={step === "payment" ? "text-ink" : ""}>2. Payment</span>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === "details" ? (
            <form onSubmit={handleContinueToPayment} className="flex flex-col gap-10">
              <fieldset>
                <legend className="mb-4 font-sans text-xs font-medium uppercase tracking-widest2 text-ink">
                  Contact
                </legend>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="input-luxury"
                />
              </fieldset>

              <fieldset>
                <legend className="mb-4 font-sans text-xs font-medium uppercase tracking-widest2 text-ink">
                  Shipping Address
                </legend>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <input required placeholder="Full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="input-luxury sm:col-span-2" />
                  <input required placeholder="Address line 1" value={form.line1} onChange={(e) => update("line1", e.target.value)} className="input-luxury sm:col-span-2" />
                  <input placeholder="Address line 2 (optional)" value={form.line2} onChange={(e) => update("line2", e.target.value)} className="input-luxury sm:col-span-2" />
                  <input required placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className="input-luxury" />
                  <input placeholder="State / Province" value={form.state} onChange={(e) => update("state", e.target.value)} className="input-luxury" />
                  <input required placeholder="Postal code" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className="input-luxury" />
                  <select required value={form.country} onChange={(e) => update("country", e.target.value)} className="input-luxury">
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input-luxury sm:col-span-2" />
                </div>
              </fieldset>

              <Button type="submit" size="lg" isLoading={submitting} className="w-full sm:w-auto">
                Continue to Payment
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              <button
                onClick={() => setStep("details")}
                className="w-fit font-sans text-xs text-ink-muted underline underline-offset-4"
              >
                ← Edit shipping details
              </button>
              {clientSecret && (
                <StripeProvider clientSecret={clientSecret}>
                  <PaymentForm totalCents={totalCents} />
                </StripeProvider>
              )}
            </div>
          )}
        </div>

        <div className="h-fit border border-border p-8">
          <h2 className="font-display text-2xl text-ink">Order Summary</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {lines.map((line) => (
              <li key={line.variantId} className="flex gap-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-beige-light">
                  {line.imageUrl && <Image src={line.imageUrl} alt="" fill className="object-cover" />}
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-ivory">
                    {line.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm text-ink">{line.productName}</p>
                  <p className="font-sans text-xs text-ink-muted">
                    {line.color} / {line.size}
                  </p>
                </div>
                <span className="font-sans text-sm text-ink">{formatPrice(line.unitPriceCents * line.quantity)}</span>
              </li>
            ))}
          </ul>

          {step === "details" && (
            <div className="mt-6 flex gap-2 border-t border-border pt-6">
              <input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="input-luxury flex-1"
              />
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 font-sans text-sm text-ink">
            <div className="flex justify-between">
              <span className="text-ink-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Shipping</span>
              <span>{shippingCents === 0 ? "Free" : formatPrice(shippingCents)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-display text-lg">
              <span>Total</span>
              <span>{formatPrice(step === "payment" ? totalCents : estimatedTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
