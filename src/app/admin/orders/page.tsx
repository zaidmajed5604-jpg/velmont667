import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatPrice } from "@/lib/utils/format";
import OrderStatusSelect from "@/components/admin/order-status-select";

export const metadata = { title: "Admin — Orders" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, email, total_cents, currency, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">Orders</h1>

      <div className="mt-8 overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-beige-light text-left text-xs uppercase tracking-widest2 text-ink-muted">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">{order.order_number}</td>
                <td className="px-4 py-3 text-ink-muted">{order.email}</td>
                <td className="px-4 py-3 text-ink-muted">{formatDateTime(order.created_at)}</td>
                <td className="px-4 py-3 text-ink-muted">{formatPrice(order.total_cents, order.currency)}</td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders ?? []).length === 0 && (
          <p className="px-4 py-8 text-center font-sans text-sm text-ink-muted">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
