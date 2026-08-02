"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductWithDetails } from "@/lib/types";
import { useWishlistStore } from "@/store/wishlist-store";
import ProductCard from "@/components/product/product-card";
import Button from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, [productIds]);

  return (
    <div className="container-luxury min-h-[60vh] pb-section-sm pt-32">
      <Reveal>
        <h1 className="mb-12 font-display text-display-lg font-normal text-ink">Your Wishlist</h1>
      </Reveal>

      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <p className="font-sans text-base text-ink-muted">Your wishlist is empty.</p>
          <Link href="/shop">
            <Button>Discover the Collection</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
