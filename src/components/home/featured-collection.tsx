import Link from "next/link";
import Image from "next/image";
import type { Collection } from "@/lib/types";
import Reveal from "@/components/ui/reveal";

export default function FeaturedCollection({ collection }: { collection: Collection }) {
  return (
    <section className="container-luxury py-section-sm md:py-section">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative aspect-[4/5] w-full overflow-hidden lg:order-2">
          {collection.hero_image_url && (
            <Image
              src={collection.hero_image_url}
              alt={collection.name}
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
            />
          )}
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col items-start lg:order-1">
          <span className="eyebrow">Featured Collection</span>
          <h2 className="mt-5 max-w-md text-balance font-display text-display-md font-normal text-ink md:text-display-lg">
            {collection.name}
          </h2>
          {collection.description && (
            <p className="mt-6 max-w-md font-sans text-[15px] leading-relaxed text-ink-muted">
              {collection.description}
            </p>
          )}
          <Link href={`/collections/${collection.slug}`} className="btn-secondary mt-10">
            Explore the Edit
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
