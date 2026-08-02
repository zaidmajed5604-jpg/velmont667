import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";
import ProductDeleteButton from "@/components/admin/product-delete-button";

export const metadata = { title: "Admin — Products" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku, category, price_cents, is_published, is_new_arrival, is_best_seller")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-normal text-ink">Products</h1>
        <Link href="/admin/products/new" className="btn-primary px-6 py-2.5 text-sm">
          + New Product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-beige-light text-left text-xs uppercase tracking-widest2 text-ink-muted">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">{product.name}</td>
                <td className="px-4 py-3 text-ink-muted">{product.sku}</td>
                <td className="px-4 py-3 text-ink-muted">{product.category}</td>
                <td className="px-4 py-3 text-ink-muted">{formatPrice(product.price_cents)}</td>
                <td className="px-4 py-3">
                  <span className={product.is_published ? "text-success" : "text-ink-muted"}>
                    {product.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link href={`/admin/products/${product.id}`} className="text-ink underline underline-offset-4">
                      Edit
                    </Link>
                    <ProductDeleteButton productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(products ?? []).length === 0 && (
          <p className="px-4 py-8 text-center font-sans text-sm text-ink-muted">No products yet.</p>
        )}
      </div>
    </div>
  );
}
