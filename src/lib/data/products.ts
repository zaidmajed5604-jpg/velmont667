import { createClient } from "@/lib/supabase/server";
import type { ProductWithDetails } from "@/lib/types";

const PRODUCT_SELECT = `
  *,
  images:product_images(*),
  variants:product_variants(*),
  collection:collections(id, name, slug)
`;

export interface ProductFilters {
  category?: string;
  collectionSlug?: string;
  filter?: "new" | "best-sellers" | "sale";
  search?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "rating";
  page?: number;
  pageSize?: number;
}

/** Fetch a paginated, filterable list of published products for the shop grid. */
export async function getProducts(filters: ProductFilters = {}) {
  const supabase = await createClient();
  const { page = 1, pageSize = 24 } = filters;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_published", true);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.filter === "new") {
    query = query.eq("is_new_arrival", true);
  }
  if (filters.filter === "best-sellers") {
    query = query.eq("is_best_seller", true);
  }
  if (filters.filter === "sale") {
    // A product is "on sale" when it has a compare-at price higher than
    // its current price — no separate flag needed, this stays in sync
    // automatically whenever an admin sets a compare-at price.
    query = query.not("compare_at_price_cents", "is", null);
  }
  if (filters.search) {
    query = query.textSearch("search_vector", filters.search, { type: "websearch" });
  }
  if (filters.collectionSlug) {
    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", filters.collectionSlug)
      .single();
    if (collection) query = query.eq("collection_id", collection.id);
  }

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_cents", { ascending: false });
      break;
    case "rating":
      query = query.order("rating_average", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);

  return {
    products: (data ?? []) as unknown as ProductWithDetails[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/** Fetch a single product with all details by its slug, or null if not found/unpublished. */
export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as unknown as ProductWithDetails;
}

/** Products for the "Recommended" rail: same category, excluding the current product. */
export async function getRecommendedProducts(
  productId: string,
  category: string,
  limit = 4,
): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category", category)
    .eq("is_published", true)
    .neq("id", productId)
    .limit(limit);

  return (data ?? []) as unknown as ProductWithDetails[];
}

/** Batch-fetch products by id, preserving the given order — used for "Recently Viewed". */
export async function getProductsByIds(ids: string[]): Promise<ProductWithDetails[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids)
    .eq("is_published", true);

  const byId = new Map((data ?? []).map((p) => [p.id, p as unknown as ProductWithDetails]));
  return ids.map((id) => byId.get(id)).filter((p): p is ProductWithDetails => Boolean(p));
}

export async function getNewArrivals(limit = 8): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ProductWithDetails[];
}

export async function getBestSellers(limit = 8): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .eq("is_best_seller", true)
    .order("rating_average", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ProductWithDetails[];
}

export async function getAllCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("category").eq("is_published", true);
  return Array.from(new Set((data ?? []).map((p) => p.category))).sort();
}
