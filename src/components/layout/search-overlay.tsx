"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, Search as SearchIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductWithDetails } from "@/lib/types";
import PriceTag from "@/components/ui/price-tag";
import FocusTrap from "@/components/ui/focus-trap";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&pageSize=6`);
        const data = await res.json();
        setResults(data.products ?? []);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce so we don't fire a query per keystroke

    return () => clearTimeout(timeout);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ivory"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <FocusTrap onEscape={onClose}>
            <div className="container-luxury flex h-20 items-center justify-end">
              <button onClick={onClose} aria-label="Close search">
                <X className="h-6 w-6 text-ink" strokeWidth={1.5} />
              </button>
            </div>

            <div className="container-luxury pt-8">
              <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-center gap-4 border-b border-ink pb-4">
                <SearchIcon className="h-5 w-5 text-ink-muted" strokeWidth={1.5} />
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for tailoring, outerwear, cashmere…"
                  className="w-full border-0 bg-transparent font-display text-2xl text-ink placeholder:text-ink-muted/50 focus:outline-none"
                  aria-label="Search products"
                />
              </form>

              <div className="mx-auto mt-8 max-w-2xl">
                {loading && <p className="font-sans text-sm text-ink-muted">Searching…</p>}
                {!loading && results.length > 0 && (
                  <ul className="flex flex-col divide-y divide-border">
                    {results.map((product) => {
                      const image = product.images[0];
                      return (
                        <li key={product.id}>
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-4 py-4"
                          >
                            {image && (
                              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-beige-light">
                                <Image src={image.url} alt="" fill className="object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-display text-lg text-ink">{product.name}</p>
                              <p className="font-sans text-xs text-ink-muted">{product.category}</p>
                            </div>
                            <PriceTag priceCents={product.price_cents} currency={product.currency} size="sm" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {!loading && query.trim().length >= 2 && results.length === 0 && (
                  <p className="font-sans text-sm text-ink-muted">No results for &ldquo;{query}&rdquo;.</p>
                )}
              </div>
            </div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
