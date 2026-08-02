import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/product-form";
import type { ProductWithDetails } from "@/lib/types";

export const metadata = { title: "Admin — Edit Product" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">Edit Product</h1>
      <div className="mt-8">
        <ProductForm product={product as unknown as ProductWithDetails} />
      </div>
    </div>
  );
}
