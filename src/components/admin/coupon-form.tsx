"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { couponAdminSchema } from "@/lib/validations/schemas";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import type { CouponType } from "@/lib/types";

export default function CouponForm() {
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [percentage, setPercentage] = useState(10);
  const [valueCents, setValueCents] = useState(1000);
  const [minSubtotalCents, setMinSubtotalCents] = useState(0);
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = couponAdminSchema.safeParse({
      code,
      type,
      percentage: type === "percentage" ? percentage : null,
      valueCents: type === "fixed_amount" ? valueCents : null,
      minSubtotalCents,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isActive: true,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("coupons").insert({
      code: parsed.data.code,
      type: parsed.data.type,
      percentage: parsed.data.percentage,
      value_cents: parsed.data.valueCents,
      min_subtotal_cents: parsed.data.minSubtotalCents,
      expires_at: parsed.data.expiresAt,
      is_active: true,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.code === "23505" ? "That coupon code already exists." : "Failed to create coupon.");
      return;
    }

    toast.success("Coupon created.");
    setCode("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-fit flex-col gap-4 border border-border p-6">
      <h2 className="font-display text-xl text-ink">New Coupon</h2>
      <input
        placeholder="Code (e.g. SUMMER25)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="input-luxury"
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value as CouponType)} className="input-luxury">
        <option value="percentage">Percentage Off</option>
        <option value="fixed_amount">Fixed Amount Off</option>
        <option value="free_shipping">Free Shipping</option>
      </select>

      {type === "percentage" && (
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-ink-muted">Percentage</span>
          <input type="number" min={1} max={100} value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} className="input-luxury" />
        </label>
      )}
      {type === "fixed_amount" && (
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-ink-muted">Value (cents)</span>
          <input type="number" min={0} value={valueCents} onChange={(e) => setValueCents(Number(e.target.value))} className="input-luxury" />
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="font-sans text-xs text-ink-muted">Minimum subtotal (cents)</span>
        <input type="number" min={0} value={minSubtotalCents} onChange={(e) => setMinSubtotalCents(Number(e.target.value))} className="input-luxury" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-sans text-xs text-ink-muted">Expires (optional)</span>
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="input-luxury" />
      </label>

      <Button type="submit" isLoading={submitting} className="w-full">
        Create Coupon
      </Button>
    </form>
  );
}
