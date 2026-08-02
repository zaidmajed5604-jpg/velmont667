import { createClient } from "@/lib/supabase/server";
import type { Collection } from "@/lib/types";

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw new Error(`Failed to fetch collections: ${error.message}`);
  return data ?? [];
}

export async function getFeaturedCollection(): Promise<Collection | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(1)
    .single();
  return data ?? null;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").eq("slug", slug).single();
  return data ?? null;
}
