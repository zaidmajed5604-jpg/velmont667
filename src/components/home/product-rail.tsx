import type { ProductWithDetails } from "@/lib/types";
import ProductCard from "@/components/product/product-card";
import SectionHeading from "@/components/ui/section-heading";
import Reveal from "@/components/ui/reveal";

interface ProductRailProps {
  eyebrow: string;
  title: string;
  description?: string;
  products: ProductWithDetails[];
  viewAllHref: string;
}

export default function ProductRail({ eyebrow, title, description, products, viewAllHref }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <section className="container-luxury py-section-sm md:py-section">
      <Reveal>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          cta={{ label: "View All", href: viewAllHref }}
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={Math.min(i * 0.08, 0.4)}>
            <ProductCard product={product} priority={i < 2} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
