import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/data/collections";
import { getProducts } from "@/lib/data/products";
import ProductCard from "@/components/product/product-card";
import Reveal from "@/components/ui/reveal";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const { products } = await getProducts({ collectionSlug: slug, pageSize: 48 });

  return (
    <div className="pb-section-sm md:pb-section">
      <div className="relative flex h-[60svh] w-full items-center justify-center overflow-hidden bg-ink">
        {collection.hero_image_url && (
          <Image
            src={collection.hero_image_url}
            alt={collection.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
        )}
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className="font-sans text-xs font-medium uppercase tracking-widest3 text-ivory/70">
            Collection
          </span>
          <h1 className="mt-5 font-display text-display-lg font-normal text-ivory">{collection.name}</h1>
          {collection.description && (
            <p className="mx-auto mt-5 max-w-lg font-sans text-[15px] leading-relaxed text-ivory/85">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      <div className="container-luxury mt-16">
        <Reveal>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
