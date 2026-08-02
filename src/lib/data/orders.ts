import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return (data ?? []) as unknown as OrderWithItems[];
}

export async function getOrderByNumber(orderNumber: string, userId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("order_number", orderNumber)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as unknown as OrderWithItems;
}
