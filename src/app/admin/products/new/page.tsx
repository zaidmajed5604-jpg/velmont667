import ProductForm from "@/components/admin/product-form";

export const metadata = { title: "Admin — New Product" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">New Product</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
