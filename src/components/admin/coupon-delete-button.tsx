"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CouponDeleteButton({ couponId, code }: { couponId: string; code: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("coupons").delete().eq("id", couponId);
    setDeleting(false);

    if (error) {
      toast.error("Failed to delete coupon.");
      return;
    }
    toast.success("Coupon deleted.");
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={deleting} className="text-error underline underline-offset-4 disabled:opacity-50">
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
