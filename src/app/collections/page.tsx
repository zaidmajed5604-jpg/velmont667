import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCollections } from "@/lib/data/collections";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore VELMONT's seasonal collections and curated edits.",
};

export const revalidate = 3600;

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="container-luxury pb-section-sm pt-32 md:pb-section">
      <Reveal>
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="eyebrow">Curated Edits</span>
          <h1 className="mt-5 font-display text-display-lg font-normal text-ink">Collections</h1>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {collections.map((collection, i) => (
          <Reveal key={collection.id} delay={i * 0.1}>
            <Link href={`/collections/${collection.slug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {collection.hero_image_url && (
                  <Image
                    src={collection.hero_image_url}
                    alt={collection.name}
                    fill
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <h2 className="font-display text-3xl text-ivory">{collection.name}</h2>
                </div>
              </div>
              {collection.description && (
                <p className="mt-4 max-w-md font-sans text-sm text-ink-muted">{collection.description}</p>
              )}
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
