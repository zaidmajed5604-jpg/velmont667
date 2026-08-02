"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProductWithDetails } from "@/lib/types";
import { getStockStatus } from "@/lib/types";
import Rating from "@/components/ui/rating";
import PriceTag from "@/components/ui/price-tag";
import WishlistButton from "@/components/product/wishlist-button";
import QuickAdd from "@/components/product/quick-add";
import { cn } from "@/lib/utils/cn";

interface ProductCardProps {
  product: ProductWithDetails;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const primaryImage = product.images.find((img) => !img.is_hover_image) ?? product.images[0];
  const hoverImage = product.images.find((img) => img.is_hover_image);

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  const lowestThreshold = product.variants[0]?.low_stock_threshold ?? 3;
  const stockStatus = getStockStatus(totalStock, lowestThreshold * product.variants.length || 3);

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-beige-light">
        <Link href={`/product/${product.slug}`} className="block h-full w-full" tabIndex={-1}>
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 23vw, (min-width: 768px) 45vw, 90vw"
              className={cn(
                "object-cover transition-opacity duration-700 ease-luxury",
                hoverImage && "group-hover:opacity-0",
              )}
            />
          )}
          {hoverImage && (
            <Image
              src={hoverImage.url}
              alt=""
              fill
              sizes="(min-width: 1280px) 23vw, (min-width: 768px) 45vw, 90vw"
              className="object-cover opacity-0 transition-opacity duration-700 ease-luxury group-hover:opacity-100"
              aria-hidden="true"
            />
          )}
        </Link>

        <WishlistButton productId={product.id} productName={product.name} />

        {product.is_new_arrival && (
          <span className="absolute left-3 top-3 bg-paper/90 px-2.5 py-1 font-sans text-[11px] font-medium uppercase tracking-widest2 text-ink backdrop-blur-sm">
            New
          </span>
        )}

        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-400 ease-luxury group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            disabled={stockStatus === "out-of-stock"}
            className="w-full bg-ink py-3 font-sans text-xs font-medium uppercase tracking-widest2 text-ivory transition-colors duration-300 hover:bg-brown-dark disabled:cursor-not-allowed disabled:bg-ink-muted"
          >
            {stockStatus === "out-of-stock" ? "Out of Stock" : "Quick Add"}
          </button>
        </div>
      </div>

      <Link href={`/product/${product.slug}`} className="mt-4 flex flex-col gap-1.5">
        <h3 className="font-display text-lg font-normal leading-snug text-ink">{product.name}</h3>
        <PriceTag
          priceCents={product.price_cents}
          compareAtPriceCents={product.compare_at_price_cents}
          currency={product.currency}
          size="sm"
        />
        <div className="flex items-center justify-between pt-0.5">
          {product.rating_count > 0 ? (
            <Rating value={product.rating_average} count={product.rating_count} />
          ) : (
            <span className="font-sans text-xs text-ink-muted">Be the first to review</span>
          )}
        </div>
      </Link>

      {quickAddOpen && (
        <QuickAdd product={product} onClose={() => setQuickAddOpen(false)} />
      )}
    </div>
  );
}
