"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { productAdminSchema } from "@/lib/validations/schemas";
import { slugify } from "@/lib/utils/format";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import type { ProductWithDetails } from "@/lib/types";

interface ProductFormProps {
  product?: ProductWithDetails;
}

interface ImageRow {
  url: string;
  altText: string;
  isHover: boolean;
}
interface VariantRow {
  id?: string;
  size: string;
  color: string;
  colorHex: string;
  stockQuantity: number;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState(product?.category ?? "Tailoring");
  const [description, setDescription] = useState(product?.description ?? "");
  const [material, setMaterial] = useState(product?.material ?? "");
  const [careInstructions, setCareInstructions] = useState(product?.care_instructions ?? "");
  const [priceCents, setPriceCents] = useState(product?.price_cents ?? 0);
  const [compareAtPriceCents, setCompareAtPriceCents] = useState(product?.compare_at_price_cents ?? 0);
  const [isNewArrival, setIsNewArrival] = useState(product?.is_new_arrival ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.is_best_seller ?? false);
  const [isPublished, setIsPublished] = useState(product?.is_published ?? true);
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((img) => ({ url: img.url, altText: img.alt_text, isHover: img.is_hover_image })) ?? [
      { url: "", altText: "", isHover: false },
    ],
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.color_hex ?? "#22283A",
      stockQuantity: v.stock_quantity,
    })) ?? [{ size: "M", color: "Navy", colorHex: "#22283A", stockQuantity: 10 }],
  );
  const [submitting, setSubmitting] = useState(false);

  function updateImage(i: number, patch: Partial<ImageRow>) {
    setImages((prev) => prev.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));
  }
  function updateVariant(i: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = productAdminSchema.safeParse({
      sku,
      slug: slug || slugify(name),
      name,
      description,
      careInstructions: careInstructions || undefined,
      material: material || undefined,
      priceCents: Number(priceCents),
      compareAtPriceCents: compareAtPriceCents ? Number(compareAtPriceCents) : null,
      category,
      isNewArrival,
      isBestSeller,
      isPublished,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      let productId = product?.id;

      if (isEditing && productId) {
        const { error } = await supabase
          .from("products")
          .update({
            sku: parsed.data.sku,
            slug: parsed.data.slug,
            name: parsed.data.name,
            description: parsed.data.description,
            care_instructions: parsed.data.careInstructions ?? null,
            material: parsed.data.material ?? null,
            price_cents: parsed.data.priceCents,
            compare_at_price_cents: parsed.data.compareAtPriceCents,
            category: parsed.data.category,
            is_new_arrival: parsed.data.isNewArrival,
            is_best_seller: parsed.data.isBestSeller,
            is_published: parsed.data.isPublished,
          })
          .eq("id", productId);
        if (error) throw error;

        // Simplest consistent approach: replace images/variants wholesale.
        await supabase.from("product_images").delete().eq("product_id", productId);
        await supabase.from("product_variants").delete().eq("product_id", productId);
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({
            sku: parsed.data.sku,
            slug: parsed.data.slug,
            name: parsed.data.name,
            description: parsed.data.description,
            care_instructions: parsed.data.careInstructions ?? null,
            material: parsed.data.material ?? null,
            price_cents: parsed.data.priceCents,
            compare_at_price_cents: parsed.data.compareAtPriceCents,
            category: parsed.data.category,
            is_new_arrival: parsed.data.isNewArrival,
            is_best_seller: parsed.data.isBestSeller,
            is_published: parsed.data.isPublished,
          })
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      const validImages = images.filter((img) => img.url.trim());
      if (validImages.length > 0 && productId) {
        const { error } = await supabase.from("product_images").insert(
          validImages.map((img, i) => ({
            product_id: productId,
            url: img.url,
            alt_text: img.altText,
            display_order: i,
            is_hover_image: img.isHover,
          })),
        );
        if (error) throw error;
      }

      const validVariants = variants.filter((v) => v.size && v.color);
      if (validVariants.length > 0 && productId) {
        const { error } = await supabase.from("product_variants").insert(
          validVariants.map((v) => ({
            product_id: productId,
            size: v.size,
            color: v.color,
            color_hex: v.colorHex,
            sku_suffix: `${v.color.slice(0, 2).toUpperCase()}${v.size}`,
            stock_quantity: Number(v.stockQuantity),
          })),
        );
        if (error) throw error;
      }

      toast.success(isEditing ? "Product updated." : "Product created.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product. Check that the SKU and slug are unique.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-10">
      <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <legend className="mb-2 font-sans text-xs uppercase tracking-widest2 text-ink-muted">Details</legend>
        <input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className="input-luxury sm:col-span-2" required />
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className="input-luxury" required />
        <input placeholder="Slug (auto-generated if blank)" value={slug} onChange={(e) => setSlug(e.target.value)} className="input-luxury" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-luxury">
          {["Tailoring", "Outerwear", "Knitwear", "Shirts", "Trousers", "Accessories"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input placeholder="Material" value={material} onChange={(e) => setMaterial(e.target.value)} className="input-luxury" />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="input-luxury resize-none sm:col-span-2"
          required
        />
        <textarea
          placeholder="Care instructions"
          value={careInstructions}
          onChange={(e) => setCareInstructions(e.target.value)}
          rows={2}
          className="input-luxury resize-none sm:col-span-2"
        />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <legend className="mb-2 font-sans text-xs uppercase tracking-widest2 text-ink-muted">Pricing</legend>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-ink-muted">Price (cents)</span>
          <input type="number" min={0} value={priceCents} onChange={(e) => setPriceCents(Number(e.target.value))} className="input-luxury" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-ink-muted">Compare-at price (cents, optional)</span>
          <input type="number" min={0} value={compareAtPriceCents} onChange={(e) => setCompareAtPriceCents(Number(e.target.value))} className="input-luxury" />
        </label>
      </fieldset>

      <fieldset className="flex flex-wrap gap-6">
        <legend className="mb-2 w-full font-sans text-xs uppercase tracking-widest2 text-ink-muted">Flags</legend>
        <label className="flex items-center gap-2 font-sans text-sm text-ink">
          <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="accent-ink" />
          New Arrival
        </label>
        <label className="flex items-center gap-2 font-sans text-sm text-ink">
          <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="accent-ink" />
          Best Seller
        </label>
        <label className="flex items-center gap-2 font-sans text-sm text-ink">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-ink" />
          Published
        </label>
      </fieldset>

      <fieldset>
        <div className="mb-3 flex items-center justify-between">
          <legend className="font-sans text-xs uppercase tracking-widest2 text-ink-muted">Images</legend>
          <button
            type="button"
            onClick={() => setImages((prev) => [...prev, { url: "", altText: "", isHover: false }])}
            className="flex items-center gap-1 font-sans text-xs text-ink underline underline-offset-4"
          >
            <Plus className="h-3 w-3" /> Add Image
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {images.map((img, i) => (
            <div key={i} className="flex items-center gap-3">
              <input placeholder="Image URL" value={img.url} onChange={(e) => updateImage(i, { url: e.target.value })} className="input-luxury flex-1" />
              <label className="flex items-center gap-1.5 whitespace-nowrap font-sans text-xs text-ink-muted">
                <input type="checkbox" checked={img.isHover} onChange={(e) => updateImage(i, { isHover: e.target.checked })} className="accent-ink" />
                Hover
              </label>
              <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove image">
                <Trash2 className="h-4 w-4 text-ink-muted hover:text-error" />
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <div className="mb-3 flex items-center justify-between">
          <legend className="font-sans text-xs uppercase tracking-widest2 text-ink-muted">Variants</legend>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, { size: "M", color: "Navy", colorHex: "#22283A", stockQuantity: 10 }])}
            className="flex items-center gap-1 font-sans text-xs text-ink underline underline-offset-4"
          >
            <Plus className="h-3 w-3" /> Add Variant
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-5 items-center gap-3">
              <input placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} className="input-luxury" />
              <input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} className="input-luxury" />
              <input type="color" value={v.colorHex} onChange={(e) => updateVariant(i, { colorHex: e.target.value })} className="h-10 w-full border border-border" />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={v.stockQuantity}
                onChange={(e) => updateVariant(i, { stockQuantity: Number(e.target.value) })}
                className="input-luxury"
              />
              <button type="button" onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove variant">
                <Trash2 className="h-4 w-4 text-ink-muted hover:text-error" />
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <Button type="submit" isLoading={submitting} className="w-fit">
        {isEditing ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
