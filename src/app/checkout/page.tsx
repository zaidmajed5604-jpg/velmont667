"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, ShieldCheck, BadgeCheck } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { checkoutSchema } from "@/lib/validations/schemas";
import { formatPrice } from "@/lib/utils/format";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
  EXPRESS_SHIPPING_CENTS,
  SHIPPING_METHODS,
  COUNTRIES,
} from "@/lib/constants";
import Button from "@/components/ui/button";
import StripeProvider from "@/components/checkout/stripe-provider";
import PaymentForm from "@/components/checkout/payment-form";
import { toast } from "sonner";

type Step = "details" | "payment";
type ShippingMethod = "standard" | "express";

const EMPTY_ADDRESS = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  phone: "",
};

export default function CheckoutPage() {
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotalCents());
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [totalCents, setTotalCents] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [orderNotes, setOrderNotes] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [email, setEmail] = useState("");
  const [shippingForm, setShippingForm] = useState({ ...EMPTY_ADDRESS });
  const [billingForm, setBillingForm] = useState({ ...EMPTY_ADDRESS });

  const shippingCents =
    shippingMethod === "express"
      ? EXPRESS_SHIPPING_CENTS
      : subtotal >= FREE_SHIPPING_THRESHOLD_CENTS
        ? 0
        : STANDARD_SHIPPING_CENTS;
  const estimatedTotal = subtotal + shippingCents;

  function updateShipping<K extends keyof typeof shippingForm>(key: K, value: string) {
    setShippingForm((prev) => ({ ...prev, [key]: value }));
  }
  function updateBilling<K extends keyof typeof billingForm>(key: K, value: string) {
    setBillingForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();

    const toAddressInput = (f: typeof shippingForm) => ({
      label: "Shipping",
      fullName: f.fullName,
      line1: f.line1,
      line2: f.line2 || undefined,
      city: f.city,
      state: f.state || undefined,
      postalCode: f.postalCode,
      country: f.country,
      phone: f.phone || undefined,
    });

    const checkoutPayload = {
      email,
      shippingAddress: toAddressInput(shippingForm),
      billingAddressSameAsShipping: billingSameAsShipping,
      billingAddress: billingSameAsShipping ? undefined : toAddressInput(billingForm),
      couponCode: couponCode || undefined,
      shippingMethod,
      orderNotes: orderNotes || undefined,
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-luxury"
                />
              </fieldset>

              <fieldset>
                <legend className="mb-4 font-sans text-xs font-medium uppercase tracking-widest2 text-ink">
                  Shipping Address
                </legend>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <input required placeholder="Full name" value={shippingForm.fullName} onChange={(e) => updateShipping("fullName", e.target.value)} className="input-luxury sm:col-span-2" />
                  <input required placeholder="Address line 1" value={shippingForm.line1} onChange={(e) => updateShipping("line1", e.target.value)} className="input-luxury sm:col-span-2" />
                  <input placeholder="Address line 2 (optional)" value={shippingForm.line2} onChange={(e) => updateShipping("line2", e.target.value)} className="input-luxury sm:col-span-2" />
                  <input required placeholder="City" value={shippingForm.city} onChange={(e) => updateShipping("city", e.target.value)} className="input-luxury" />
                  <input placeholder="State / Province" value={shippingForm.state} onChange={(e) => updateShipping("state", e.target.value)} className="input-luxury" />
                  <input required placeholder="Postal code" value={shippingForm.postalCode} onChange={(e) => updateShipping("postalCode", e.target.value)} className="input-luxury" />
                  <select required value={shippingForm.country} onChange={(e) => updateShipping("country", e.target.value)} className="input-luxury">
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input placeholder="Phone (optional)" value={shippingForm.phone} onChange={(e) => updateShipping("phone", e.target.value)} className="input-luxury sm:col-span-2" />
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-4 font-sans text-xs font-medium uppercase tracking-widest2 text-ink">
                  Shipping Method
                </legend>
                <div className="flex flex-col gap-3">
                  {SHIPPING_METHODS.map((method) => {
                    const price =
                      method.value === "express"
                        ? EXPRESS_SHIPPING_CENTS
                        : subtotal >= FREE_SHIPPING_THRESHOLD_CENTS
                          ? 0
                          : STANDARD_SHIPPING_CENTS;
                    return (
                      <label
                        key={method.value}
                        className={`flex cursor-pointer items-center justify-between border px-5 py-4 transition-colors ${
                          shippingMethod === method.value ? "border-ink" : "border-border hover:border-ink/40"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === method.value}
                            onChange={() => setShippingMethod(method.value)}
                            className="accent-ink"
                          />
                          <span>
                            <span className="block font-sans text-sm text-ink">{method.label}</span>
                            <span className="block font-sans text-xs text-ink-muted">{method.description}</span>
                          </span>
                        </span>
                        <span className="font-sans text-sm text-ink">
                          {price === 0 ? "Free" : formatPrice(price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <label className="flex items-center gap-3 font-sans text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                    className="h-4 w-4 accent-ink"
                  />
                  Billing address same as shipping
                </label>

                {!billingSameAsShipping && (
                  <div className="mt-5 grid grid-cols-1 gap-5 border-t border-border pt-5 sm:grid-cols-2">
                    <legend className="mb-1 font-sans text-xs font-medium uppercase tracking-widest2 text-ink sm:col-span-2">
                      Billing Address
                    </legend>
                    <input required placeholder="Full name" value={billingForm.fullName} onChange={(e) => updateBilling("fullName", e.target.value)} className="input-luxury sm:col-span-2" />
                    <input required placeholder="Address line 1" value={billingForm.line1} onChange={(e) => updateBilling("line1", e.target.value)} className="input-luxury sm:col-span-2" />
                    <input placeholder="Address line 2 (optional)" value={billingForm.line2} onChange={(e) => updateBilling("line2", e.target.value)} className="input-luxury sm:col-span-2" />
                    <input required placeholder="City" value={billingForm.city} onChange={(e) => updateBilling("city", e.target.value)} className="input-luxury" />
                    <input placeholder="State / Province" value={billingForm.state} onChange={(e) => updateBilling("state", e.target.value)} className="input-luxury" />
                    <input required placeholder="Postal code" value={billingForm.postalCode} onChange={(e) => updateBilling("postalCode", e.target.value)} className="input-luxury" />
                    <select required value={billingForm.country} onChange={(e) => updateBilling("country", e.target.value)} className="input-luxury">
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input placeholder="Phone (optional)" value={billingForm.phone} onChange={(e) => updateBilling("phone", e.target.value)} className="input-luxury sm:col-span-2" />
                  </div>
                )}
              </fieldset>

              <fieldset>
                <legend className="mb-4 font-sans text-xs font-medium uppercase tracking-widest2 text-ink">
                  Order Notes <span className="normal-case text-ink-muted">(optional)</span>
                </legend>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Gift note, delivery instructions, or anything else we should know…"
                  rows={3}
                  maxLength={500}
                  className="input-luxury resize-none"
                />
              </fieldset>

              <Button type="submit" size="lg" isLoading={submitting} className="w-full sm:w-auto">
                Continue to Payment
              </Button>

              <TrustBadges />
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
              <TrustBadges />
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

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-6">
            <Lock className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
            <span className="font-sans text-xs text-ink-muted">Secured by Stripe · 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reassurance strip shown near the submit button — real trust signals, not decorative badges. */
function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6">
      <span className="flex items-center gap-2 font-sans text-xs text-ink-muted">
        <ShieldCheck className="h-4 w-4 text-brown-dark" strokeWidth={1.5} />
        Secure Checkout
      </span>
      <span className="flex items-center gap-2 font-sans text-xs text-ink-muted">
        <Lock className="h-4 w-4 text-brown-dark" strokeWidth={1.5} />
        Encrypted Payment
      </span>
      <span className="flex items-center gap-2 font-sans text-xs text-ink-muted">
        <BadgeCheck className="h-4 w-4 text-brown-dark" strokeWidth={1.5} />
        30-Day Returns
      </span>
    </div>
  );
}
