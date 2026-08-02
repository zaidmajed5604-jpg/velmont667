import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import ProductCard from "@/components/product/product-card";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = { title: "Search" };

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const { products, total } = q ? await getProducts({ search: q, pageSize: 48 }) : { products: [], total: 0 };

  return (
    <div className="container-luxury min-h-[60vh] pb-section-sm pt-32">
      <Reveal>
        <div className="mb-12 border-b border-border pb-8">
          <span className="eyebrow">Search Results</span>
          <h1 className="mt-5 font-display text-display-md font-normal text-ink">
            {q ? `"${q}"` : "Search VELMONT"}
          </h1>
          {q && <p className="mt-2 font-sans text-sm text-ink-muted">{total} results</p>}
        </div>
      </Reveal>

      {q && products.length === 0 && (
        <p className="py-16 text-center font-sans text-sm text-ink-muted">
          No pieces matched your search. Try a different term.
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
