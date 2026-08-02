"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ProductDeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;

    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);
    setDeleting(false);

    if (error) {
      toast.error("Failed to delete product.");
      return;
    }
    toast.success("Product deleted.");
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={deleting} className="text-error underline underline-offset-4 disabled:opacity-50">
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
