import Image from "next/image";
import Reveal from "@/components/ui/reveal";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
  "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800",
  "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?q=80&w=800",
  "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800",
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800",
];

export default function InstagramGallery() {
  return (
    <section className="container-luxury py-section-sm md:py-section">
      <Reveal className="flex flex-col items-center text-center">
        <span className="eyebrow">Follow Along</span>
        <h2 className="mt-5 font-display text-display-sm font-normal text-ink">@velmont</h2>
      </Reveal>

      <div className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6">
        {GALLERY_IMAGES.map((src, i) => (
          <a
            key={src}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden"
            aria-label="View on Instagram"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 768px) 16vw, 33vw"
              className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
              loading={i < 6 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />
          </a>
        ))}
      </div>
    </section>
  );
}
