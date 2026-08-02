"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductWithDetails } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";
import Button from "@/components/ui/button";
import PriceTag from "@/components/ui/price-tag";
import { toast } from "sonner";

interface QuickAddProps {
  product: ProductWithDetails;
  onClose: () => void;
}

/** Lightweight modal letting a shopper pick size/color and add to cart without leaving the grid. */
export default function QuickAdd({ product, onClose }: QuickAddProps) {
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor,
  );
  const image = product.images[0];

  function handleAdd() {
    if (!selectedVariant) {
      toast.error("Select a size to continue.");
      return;
    }
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPriceCents: product.price_cents,
      quantity: 1,
      imageUrl: image?.url ?? "",
      maxStock: selectedVariant.stock_quantity,
    });
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick add ${product.name}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-paper p-6 shadow-lift sm:p-8"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex gap-4">
              {image && (
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-beige-light">
                  <Image src={image.url} alt="" fill className="object-cover" />
                </div>
              )}
              <div>
                <h3 className="font-display text-xl text-ink">{product.name}</h3>
                <PriceTag priceCents={product.price_cents} currency={product.currency} size="sm" className="mt-1" />
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          </div>

          {colors.length > 1 && (
            <div className="mb-5">
              <p className="mb-2 font-sans text-xs font-medium uppercase tracking-widest2 text-ink-muted">Color</p>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`border px-3 py-1.5 font-sans text-xs transition-colors ${
                      selectedColor === color ? "border-ink bg-ink text-ivory" : "border-border text-ink"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="mb-2 font-sans text-xs font-medium uppercase tracking-widest2 text-ink-muted">Size</p>
            <div className="grid grid-cols-5 gap-2">
              {sizes.map((size) => {
                const variant = product.variants.find((v) => v.size === size && v.color === selectedColor);
                const disabled = !variant || variant.stock_quantity === 0;
                return (
                  <button
                    key={size}
                    disabled={disabled}
                    onClick={() => setSelectedSize(size)}
                    className={`border py-2.5 font-sans text-sm transition-colors ${
                      selectedSize === size
                        ? "border-ink bg-ink text-ivory"
                        : disabled
                          ? "cursor-not-allowed border-border text-ink-muted/40 line-through"
                          : "border-border text-ink hover:border-ink"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={handleAdd} className="w-full">
            Add to Bag
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
