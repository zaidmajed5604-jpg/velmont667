import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Admin — Customers" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Order count per customer, fetched separately since it's a cross-table aggregate.
  const { data: orderCounts } = await supabase.from("orders").select("user_id");
  const orderCountByUser = new Map<string, number>();
  for (const order of orderCounts ?? []) {
    if (!order.user_id) continue;
    orderCountByUser.set(order.user_id, (orderCountByUser.get(order.user_id) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">Customers</h1>

      <div className="mt-8 overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-beige-light text-left text-xs uppercase tracking-widest2 text-ink-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((customer) => (
              <tr key={customer.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">{customer.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{customer.email}</td>
                <td className="px-4 py-3 capitalize text-ink-muted">{customer.role}</td>
                <td className="px-4 py-3 text-ink-muted">{orderCountByUser.get(customer.id) ?? 0}</td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(customer.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(customers ?? []).length === 0 && (
          <p className="px-4 py-8 text-center font-sans text-sm text-ink-muted">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
