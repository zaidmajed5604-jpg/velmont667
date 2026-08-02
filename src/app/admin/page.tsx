import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";
import StatCard from "@/components/admin/stat-card";
import Link from "next/link";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ count: orderCount }, { data: recentOrders }, { count: productCount }, { count: customerCount }, { data: lowStockVariants }] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("orders")
        .select("id, order_number, email, total_cents, currency, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase
        .from("product_variants")
        .select("id, size, color, stock_quantity, low_stock_threshold, products(name)")
        .order("stock_quantity", { ascending: true })
        .limit(6),
    ]);

  const { data: revenueRows } = await supabase
    .from("orders")
    .select("total_cents")
    .gte("created_at", startOfMonth.toISOString())
    .in("status", ["paid", "processing", "shipped", "delivered"]);

  const monthRevenueCents = (revenueRows ?? []).reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">Overview</h1>
      <p className="mt-1 font-sans text-sm text-ink-muted">Store performance at a glance.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (MTD)" value={formatPrice(monthRevenueCents)} />
        <StatCard label="Orders (MTD)" value={String(orderCount ?? 0)} />
        <StatCard label="Products" value={String(productCount ?? 0)} />
        <StatCard label="Customers" value={String(customerCount ?? 0)} />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="font-sans text-xs text-ink-muted underline underline-offset-4">
              View All
            </Link>
          </div>
          <div className="border border-border">
            {(recentOrders ?? []).map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
                <div>
                  <p className="font-sans text-sm text-ink">{order.order_number}</p>
                  <p className="font-sans text-xs text-ink-muted">{order.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-sm text-ink">{formatPrice(order.total_cents, order.currency)}</p>
                  <p className="font-sans text-xs capitalize text-ink-muted">{order.status}</p>
                </div>
              </div>
            ))}
            {(recentOrders ?? []).length === 0 && (
              <p className="px-4 py-6 font-sans text-sm text-ink-muted">No orders yet.</p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Low Stock Alerts</h2>
            <Link href="/admin/inventory" className="font-sans text-xs text-ink-muted underline underline-offset-4">
              View Inventory
            </Link>
          </div>
          <div className="border border-border">
            {(lowStockVariants ?? []).map((variant) => {
              const product = variant.products as unknown as { name: string } | null;
              return (
                <div key={variant.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
                  <div>
                    <p className="font-sans text-sm text-ink">{product?.name}</p>
                    <p className="font-sans text-xs text-ink-muted">
                      {variant.color} / {variant.size}
                    </p>
                  </div>
                  <span
                    className={`font-sans text-sm ${variant.stock_quantity <= variant.low_stock_threshold ? "text-error" : "text-ink"}`}
                  >
                    {variant.stock_quantity} in stock
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
