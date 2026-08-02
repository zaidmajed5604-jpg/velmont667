import type { Metadata } from "next";
import { getProducts, getAllCategories } from "@/lib/data/products";
import ProductCard from "@/components/product/product-card";
import ShopFilters from "@/components/product/shop-filters";
import ShopSort from "@/components/product/shop-sort";
import Pagination from "@/components/ui/pagination";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full VELMONT collection — tailoring, outerwear, knitwear, and accessories.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    filter?: "new" | "best-sellers";
    sort?: "price-asc" | "price-desc" | "newest" | "rating";
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts({
      category: params.category,
      filter: params.filter,
      sort: params.sort,
      page,
    }),
    getAllCategories(),
  ]);

  const heading =
    params.filter === "new" ? "New Arrivals" : params.filter === "best-sellers" ? "Best Sellers" : params.category ?? "Shop All";

  return (
    <div className="container-luxury pb-section-sm pt-32 md:pb-section">
      <Reveal>
        <div className="mb-12 flex flex-col items-start gap-2 border-b border-border pb-8">
          <span className="eyebrow">Collection</span>
          <h1 className="font-display text-display-md font-normal text-ink md:text-display-lg">{heading}</h1>
          <p className="font-sans text-sm text-ink-muted">{total} pieces</p>
        </div>
      </Reveal>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <ShopFilters categories={categories} activeCategory={params.category} />
        </aside>

        <div className="flex-1">
          <div className="mb-8 flex justify-end">
            <ShopSort activeSort={params.sort} />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="font-display text-2xl text-ink">No pieces match these filters</p>
              <p className="font-sans text-sm text-ink-muted">Try clearing a filter or browsing a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 3} />
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
