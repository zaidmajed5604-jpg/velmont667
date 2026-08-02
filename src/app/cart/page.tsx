"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants";
import Button from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotalCents());

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotal);

  return (
    <div className="container-luxury min-h-[60vh] pb-section-sm pt-32">
      <Reveal>
        <h1 className="mb-12 font-display text-display-lg font-normal text-ink">Your Bag</h1>
      </Reveal>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <p className="font-sans text-base text-ink-muted">Your bag is currently empty.</p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="flex flex-col divide-y divide-border border-y border-border">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-6 py-8">
                  <div className="relative h-40 w-28 shrink-0 overflow-hidden bg-beige-light">
                    {line.imageUrl && <Image src={line.imageUrl} alt="" fill className="object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/product/${line.productSlug}`} className="font-display text-xl text-ink">
                          {line.productName}
                        </Link>
                        <p className="mt-1 font-sans text-sm text-ink-muted">
                          {line.color} / {line.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(line.variantId)}
                        aria-label={`Remove ${line.productName}`}
                        className="text-ink-muted hover:text-ink"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-2 text-ink hover:bg-beige-light"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center font-sans text-sm">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                          aria-label="Increase quantity"
                          disabled={line.quantity >= line.maxStock}
                          className="p-2 text-ink hover:bg-beige-light disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-sans text-base text-ink">
                        {formatPrice(line.unitPriceCents * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-fit border border-border p-8">
            <h2 className="font-display text-2xl text-ink">Order Summary</h2>
            <div className="mt-6 flex flex-col gap-3 font-sans text-sm text-ink">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Shipping</span>
                <span>{remainingForFreeShipping > 0 ? "Calculated at checkout" : "Free"}</span>
              </div>
            </div>
            {remainingForFreeShipping > 0 && (
              <p className="mt-4 font-sans text-xs text-ink-muted">
                {formatPrice(remainingForFreeShipping)} away from free shipping.
              </p>
            )}
            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
