import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/reveal";

export default function OurStory() {
  return (
    <section className="bg-beige-light">
      <div className="container-luxury grid grid-cols-1 items-center gap-10 py-section-sm md:py-section lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 flex flex-col items-start lg:order-1">
          <span className="eyebrow">Our Story</span>
          <h2 className="mt-5 max-w-md text-balance font-display text-display-md font-normal italic text-ink md:text-display-lg">
            Built on restraint, not trend
          </h2>
          <p className="mt-6 max-w-md font-sans text-[15px] leading-relaxed text-ink-muted">
            VELMONT began with a simple frustration: modern menswear had started chasing seasons
            instead of serving the people who wore it. We work with a small group of mills in
            Italy and Scotland, hold every pattern in-house, and release only what earns its
            place in a considered wardrobe.
          </p>
          <p className="mt-4 max-w-md font-sans text-[15px] leading-relaxed text-ink-muted">
            No logos. No noise. Just cloth, cut, and construction that outlasts the trend cycle.
          </p>
          <Link href="/about" className="btn-secondary mt-10">
            Read Our Story
          </Link>
        </Reveal>

        <Reveal delay={0.15} className="relative order-1 aspect-[4/5] w-full overflow-hidden lg:order-2">
          <Image
            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1600"
            alt="A tailor's workshop, with wool cloth and a half-finished jacket on a workbench"
            fill
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
