import { createClient } from "@/lib/supabase/server";
import RevenueChart from "@/components/admin/revenue-chart";
import CategoryChart from "@/components/admin/category-chart";
import StatCard from "@/components/admin/stat-card";
import { formatPrice } from "@/lib/utils/format";

export const metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: orders } = await supabase
    .from("orders")
    .select("created_at, total_cents, status")
    .gte("created_at", ninetyDaysAgo.toISOString())
    .in("status", ["paid", "processing", "shipped", "delivered"]);

  // Bucket revenue by day for the last 30 days.
  const byDay = new Map<string, number>();
  for (const order of orders ?? []) {
    const day = order.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + order.total_cents);
  }
  const revenueData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const key = date.toISOString().slice(0, 10);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: (byDay.get(key) ?? 0) / 100,
    };
  });

  // Revenue by category — join order_items -> products.
  const { data: items } = await supabase
    .from("order_items")
    .select("unit_price_cents, quantity, products(category)")
    .gte("id", "00000000-0000-0000-0000-000000000000"); // no-op filter to keep query shape explicit

  const byCategory = new Map<string, number>();
  for (const item of items ?? []) {
    const product = item.products as unknown as { category: string } | null;
    const category = product?.category ?? "Other";
    byCategory.set(category, (byCategory.get(category) ?? 0) + item.unit_price_cents * item.quantity);
  }
  const categoryData = Array.from(byCategory.entries()).map(([category, cents]) => ({
    category,
    revenue: cents / 100,
  }));

  const totalRevenueCents = (orders ?? []).reduce((sum, o) => sum + o.total_cents, 0);
  const avgOrderValueCents = orders && orders.length > 0 ? totalRevenueCents / orders.length : 0;

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">Analytics</h1>
      <p className="mt-1 font-sans text-sm text-ink-muted">Last 90 days.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={formatPrice(totalRevenueCents)} />
        <StatCard label="Orders" value={String(orders?.length ?? 0)} />
        <StatCard label="Avg. Order Value" value={formatPrice(avgOrderValueCents)} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="border border-border p-6">
          <h2 className="mb-6 font-display text-xl text-ink">Revenue — Last 30 Days</h2>
          <RevenueChart data={revenueData} />
        </div>
        <div className="border border-border p-6">
          <h2 className="mb-6 font-display text-xl text-ink">Revenue by Category</h2>
          <CategoryChart data={categoryData} />
        </div>
      </div>
    </div>
  );
}
