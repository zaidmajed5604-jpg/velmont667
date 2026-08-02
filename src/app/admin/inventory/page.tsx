import { createClient } from "@/lib/supabase/server";
import InventoryRow from "@/components/admin/inventory-row";

export const metadata = { title: "Admin — Inventory" };

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, size, color, stock_quantity, low_stock_threshold, products(name, sku)")
    .order("stock_quantity", { ascending: true })
    .limit(300);

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">Inventory</h1>
      <p className="mt-1 font-sans text-sm text-ink-muted">
        Sorted by stock level — lowest first. Edit a value and press Enter or click away to save.
      </p>

      <div className="mt-8 overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-beige-light text-left text-xs uppercase tracking-widest2 text-ink-muted">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Variant</th>
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {(variants ?? []).map((variant) => {
              const product = variant.products as unknown as { name: string; sku: string } | null;
              return (
                <InventoryRow
                  key={variant.id}
                  variantId={variant.id}
                  productName={product?.name ?? ""}
                  sku={product?.sku ?? ""}
                  size={variant.size}
                  color={variant.color}
                  stockQuantity={variant.stock_quantity}
                  lowStockThreshold={variant.low_stock_threshold}
                />
              );
            })}
          </tbody>
        </table>
        {(variants ?? []).length === 0 && (
          <p className="px-4 py-8 text-center font-sans text-sm text-ink-muted">No inventory records yet.</p>
        )}
      </div>
    </div>
  );
}
