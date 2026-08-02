"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ProductWithDetails } from "@/lib/types";
import { getStockStatus } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";
import Button from "@/components/ui/button";
import StockBadge from "@/components/ui/stock-badge";
import SizeGuideModal from "@/components/product/size-guide-modal";
import { cn } from "@/lib/utils/cn";

export default function AddToCartForm({ product }: { product: ProductWithDetails }) {
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor,
  );
  const stockStatus = selectedVariant
    ? getStockStatus(selectedVariant.stock_quantity, selectedVariant.low_stock_threshold)
    : null;

  function handleAddToCart() {
    if (!selectedVariant) {
      toast.error("Please select a size.");
      return;
    }
    const image = product.images[0];
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
  }

  return (
    <div className="flex flex-col gap-6">
      {colors.length > 1 && (
        <div>
          <p className="mb-3 font-sans text-xs font-medium uppercase tracking-widest2 text-ink-muted">
            Color — <span className="text-ink">{selectedColor}</span>
          </p>
          <div className="flex gap-3">
            {colors.map((color) => {
              const swatch = product.variants.find((v) => v.color === color)?.color_hex;
              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(null);
                  }}
                  aria-label={color}
                  aria-pressed={selectedColor === color}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    selectedColor === color ? "border-ink" : "border-transparent",
                  )}
                >
                  <span
                    className="block h-full w-full rounded-full border border-border"
                    style={{ backgroundColor: swatch ?? "#ccc" }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-sans text-xs font-medium uppercase tracking-widest2 text-ink-muted">Size</p>
          <button
            onClick={() => setSizeGuideOpen(true)}
            className="font-sans text-xs text-ink underline underline-offset-4"
          >
            Size Guide
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {sizes.map((size) => {
            const variant = product.variants.find((v) => v.size === size && v.color === selectedColor);
            const disabled = !variant || variant.stock_quantity === 0;
            return (
              <button
                key={size}
                disabled={disabled}
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={cn(
                  "border py-3 font-sans text-sm transition-colors",
                  selectedSize === size
                    ? "border-ink bg-ink text-ivory"
                    : disabled
                      ? "cursor-not-allowed border-border text-ink-muted/40 line-through"
                      : "border-border text-ink hover:border-ink",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {stockStatus && <StockBadge status={stockStatus} />}

      <Button onClick={handleAddToCart} disabled={!selectedSize || stockStatus === "out-of-stock"} size="lg">
        {stockStatus === "out-of-stock" ? "Out of Stock" : "Add to Bag"}
      </Button>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
}
