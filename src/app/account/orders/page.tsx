import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/data/orders";
import { formatDate, formatPrice } from "@/lib/utils/format";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Order History" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Payment Pending",
  paid: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

interface OrdersPageProps {
  searchParams: Promise<{ justPlaced?: string; pendingPayment?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { justPlaced, pendingPayment } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orders = await getUserOrders(user!.id);

  return (
    <div>
      <h1 className="font-display text-display-sm font-normal text-ink">Order History</h1>

      {pendingPayment && (
        <div className="mt-6 border border-brown/30 bg-beige-light p-5 font-sans text-sm text-ink">
          Your payment was received and your order is being confirmed — this page will show it
          shortly. If it doesn&rsquo;t appear within a few minutes, contact concierge@velmont.com
          with reference <span className="font-mono text-xs">{pendingPayment}</span>.
        </div>
      )}

      {justPlaced && (
        <div className="mt-6 border border-success/30 bg-success/5 p-5 font-sans text-sm text-success">
          Order {justPlaced} confirmed — thank you. You&rsquo;ll receive an email confirmation shortly.
        </div>
      )}

      {orders.length === 0 ? (
        <p className="mt-8 font-sans text-sm text-ink-muted">You haven&rsquo;t placed any orders yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-border border-y border-border">
          {orders.map((order) => (
            <li key={order.id} className="py-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-ink">{order.order_number}</p>
                  <p className="font-sans text-xs text-ink-muted">Placed {formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span
                    className={cn(
                      "font-sans text-xs font-medium uppercase tracking-widest2",
                      order.status === "delivered" && "text-success",
                      order.status === "cancelled" && "text-error",
                      !["delivered", "cancelled"].includes(order.status) && "text-brown-dark",
                    )}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="font-sans text-sm text-ink">{formatPrice(order.total_cents, order.currency)}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-3 overflow-x-auto">
                {order.items.map((item) => (
                  <div key={item.id} className="relative h-20 w-16 shrink-0 overflow-hidden bg-beige-light">
                    {item.image_url && <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />}
                  </div>
                ))}
              </div>

              {order.tracking_number && (
                <p className="mt-4 font-sans text-xs text-ink-muted">
                  Tracking ({order.tracking_carrier}):{" "}
                  <span className="text-ink">{order.tracking_number}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
