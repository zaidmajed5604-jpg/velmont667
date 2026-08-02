"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface ShopFiltersProps {
  categories: string[];
  activeCategory?: string;
}

export default function ShopFilters({ categories, activeCategory }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setCategory(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav aria-label="Filter by category">
      <h2 className="font-sans text-xs font-medium uppercase tracking-widest2 text-ink">Category</h2>
      <ul className="mt-5 flex flex-col gap-3">
        <li>
          <button
            onClick={() => setCategory(null)}
            className={cn(
              "font-sans text-sm transition-colors",
              !activeCategory ? "text-ink underline underline-offset-4" : "text-ink-muted hover:text-ink",
            )}
          >
            All Products
          </button>
        </li>
        {categories.map((category) => (
          <li key={category}>
            <button
              onClick={() => setCategory(category)}
              className={cn(
                "font-sans text-sm transition-colors",
                activeCategory === category
                  ? "text-ink underline underline-offset-4"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
