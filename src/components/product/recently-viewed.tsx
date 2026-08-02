"use client";

import { useEffect, useState } from "react";
import type { ProductWithDetails } from "@/lib/types";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import ProductCard from "@/components/product/product-card";
import SectionHeading from "@/components/ui/section-heading";
import Reveal from "@/components/ui/reveal";

/** Records the current product as viewed, then renders the rest of the recently-viewed list. */
export default function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const productIds = useRecentlyViewedStore((s) => s.productIds);
  const record = useRecentlyViewedStore((s) => s.record);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);

  useEffect(() => {
    record(currentProductId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductId]);

  useEffect(() => {
    const otherIds = productIds.filter((id) => id !== currentProductId).slice(0, 4);
    if (otherIds.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${otherIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, [productIds, currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="container-luxury border-t border-border py-section-sm">
      <Reveal>
        <SectionHeading eyebrow="Continue Browsing" title="Recently Viewed" align="left" />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
