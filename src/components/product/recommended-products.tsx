import type { ProductWithDetails } from "@/lib/types";
import ProductCard from "@/components/product/product-card";
import SectionHeading from "@/components/ui/section-heading";
import Reveal from "@/components/ui/reveal";

export default function RecommendedProducts({ products }: { products: ProductWithDetails[] }) {
  if (products.length === 0) return null;

  return (
    <section className="container-luxury border-t border-border py-section-sm">
      <Reveal>
        <SectionHeading eyebrow="You May Also Like" title="Recommended" align="left" />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
