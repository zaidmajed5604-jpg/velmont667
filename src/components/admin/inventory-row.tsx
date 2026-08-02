"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface InventoryRowProps {
  variantId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export default function InventoryRow({
  variantId,
  productName,
  sku,
  size,
  color,
  stockQuantity,
  lowStockThreshold,
}: InventoryRowProps) {
  const [value, setValue] = useState(stockQuantity);
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (value === stockQuantity) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("product_variants")
      .update({ stock_quantity: value })
      .eq("id", variantId);
    setSaving(false);

    if (error) {
      toast.error("Failed to update stock.");
      setValue(stockQuantity);
      return;
    }
    toast.success("Stock updated.");
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-ink">{productName}</td>
      <td className="px-4 py-3 text-ink-muted">{sku}</td>
      <td className="px-4 py-3 text-ink-muted">
        {color} / {size}
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          disabled={saving}
          className={cn(
            "w-20 border-0 border-b bg-transparent py-1 font-sans text-sm focus:outline-none",
            value <= lowStockThreshold ? "border-error text-error" : "border-border text-ink",
          )}
        />
      </td>
    </tr>
  );
}
