"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants";
import Button from "@/components/ui/button";
import FocusTrap from "@/components/ui/focus-trap";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotalCents());

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40"
            onClick={closeDrawer}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            <FocusTrap onEscape={closeDrawer}>
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <h2 className="font-display text-2xl text-ink">Your Bag ({lines.length})</h2>
                <button onClick={closeDrawer} aria-label="Close bag">
                  <X className="h-5 w-5 text-ink" strokeWidth={1.5} />
                </button>
              </div>

              {lines.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                  <p className="font-sans text-sm text-ink-muted">Your bag is empty.</p>
                  <Button variant="secondary" onClick={closeDrawer}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  <div className="border-b border-border px-6 py-4">
                    <p className="font-sans text-xs text-ink-muted">
                      {remainingForFreeShipping > 0
                        ? `${formatPrice(remainingForFreeShipping)} away from free shipping`
                        : "You've unlocked free shipping"}
                    </p>
                    <div className="mt-2 h-[2px] w-full bg-border">
                      <div
                        className="h-full bg-brown-dark transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <ul className="flex-1 overflow-y-auto px-6 py-4">
                    {lines.map((line) => (
                      <li key={line.variantId} className="flex gap-4 border-b border-border py-5 last:border-0">
                        <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-beige-light">
                          {line.imageUrl && (
                            <Image src={line.imageUrl} alt="" fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/product/${line.productSlug}`}
                                onClick={closeDrawer}
                                className="font-display text-base text-ink"
                              >
                                {line.productName}
                              </Link>
                              <button
                                onClick={() => removeItem(line.variantId)}
                                aria-label={`Remove ${line.productName} from bag`}
                                className="text-ink-muted hover:text-ink"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="mt-1 font-sans text-xs text-ink-muted">
                              {line.color} / {line.size}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-border">
                              <button
                                onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="p-1.5 text-ink hover:bg-beige-light"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center font-sans text-sm">{line.quantity}</span>
                              <button
                                onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                                aria-label="Increase quantity"
                                disabled={line.quantity >= line.maxStock}
                                className="p-1.5 text-ink hover:bg-beige-light disabled:opacity-30"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="font-sans text-sm text-ink">
                              {formatPrice(line.unitPriceCents * line.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-border px-6 py-6">
                    <div className="mb-4 flex items-center justify-between font-sans text-sm text-ink">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <p className="mb-4 font-sans text-xs text-ink-muted">
                      Shipping and taxes calculated at checkout.
                    </p>
                    <Link href="/checkout" onClick={closeDrawer}>
                      <Button className="w-full">Checkout</Button>
                    </Link>
                    <Link href="/cart" onClick={closeDrawer} className="mt-3 block text-center">
                      <span className="font-sans text-xs text-ink-muted underline underline-offset-4">
                        View full bag
                      </span>
                    </Link>
                  </div>
                </>
              )}
            </FocusTrap>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
