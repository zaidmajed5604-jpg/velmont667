import { createClient } from "@/lib/supabase/server";
import CouponForm from "@/components/admin/coupon-form";
import CouponDeleteButton from "@/components/admin/coupon-delete-button";
import { formatDate, formatPrice } from "@/lib/utils/format";

export const metadata = { title: "Admin — Coupons" };

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">Coupons</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[640px] font-sans text-sm">
            <thead>
              <tr className="border-b border-border bg-beige-light text-left text-xs uppercase tracking-widest2 text-ink-muted">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Redeemed</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(coupons ?? []).map((coupon) => (
                <tr key={coupon.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{coupon.code}</td>
                  <td className="px-4 py-3 capitalize text-ink-muted">{coupon.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {coupon.type === "percentage" && `${coupon.percentage}%`}
                    {coupon.type === "fixed_amount" && formatPrice(coupon.value_cents ?? 0)}
                    {coupon.type === "free_shipping" && "Free Shipping"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {coupon.times_redeemed}
                    {coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {coupon.expires_at ? formatDate(coupon.expires_at) : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CouponDeleteButton couponId={coupon.id} code={coupon.code} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(coupons ?? []).length === 0 && (
            <p className="px-4 py-8 text-center font-sans text-sm text-ink-muted">No coupons yet.</p>
          )}
        </div>

        <CouponForm />
      </div>
    </div>
  );
}
