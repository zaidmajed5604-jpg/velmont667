import { createClient } from "@/lib/supabase/server";
import type { ReviewWithAuthor } from "@/lib/types";

export async function getProductReviews(productId: string): Promise<ReviewWithAuthor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);

  return (data ?? []).map((r) => {
    const row = r as typeof r & { profiles: { full_name: string | null } | null };
    return {
      ...row,
      author_name: row.profiles?.full_name ?? "Verified Customer",
    };
  });
}

/** Whether the given user has already reviewed this product (reviews are one-per-user-per-product). */
export async function hasUserReviewed(productId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("user_id", userId);
  return (count ?? 0) > 0;
}
