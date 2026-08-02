import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The story behind VELMONT — considered menswear built on restraint, not trend.",
};

export default function AboutPage() {
  return (
    <div className="pb-section-sm md:pb-section">
      <div className="relative flex h-[70svh] w-full items-end overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2400"
          alt="A tailor at work in an atelier"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="container-luxury relative z-10 pb-16">
          <span className="font-sans text-xs font-medium uppercase tracking-widest3 text-ivory/70">
            Since 2012
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-display-lg font-normal italic text-ivory">
            Dressed for a life well considered
          </h1>
        </div>
      </div>

      <div className="container-luxury mt-20 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">The Beginning</span>
          <h2 className="mt-5 font-display text-display-sm font-normal text-ink">
            A quieter kind of luxury
          </h2>
          <p className="mt-6 font-sans text-[15px] leading-relaxed text-ink-muted">
            VELMONT began with a simple frustration: modern menswear had started chasing seasons
            instead of serving the people who wore it. Logos grew louder. Cloth grew thinner.
            Construction gave way to speed.
          </p>
          <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink-muted">
            We set out to build the opposite — a wardrobe designed to disappear into a life well
            lived, made from cloth and construction good enough that you&rsquo;d never think to
            replace it.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <span className="eyebrow">The Craft</span>
          <h2 className="mt-5 font-display text-display-sm font-normal text-ink">
            Held to a higher standard
          </h2>
          <p className="mt-6 font-sans text-[15px] leading-relaxed text-ink-muted">
            Every piece begins with cloth sourced from a small group of mills in Italy and
            Scotland — the same mills that have supplied tailoring houses for generations. Patterns
            are held in-house and refined over years, not seasons.
          </p>
          <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink-muted">
            We release only what earns its place in a considered wardrobe. No filler collections.
            No trend chasing. Just cloth, cut, and construction meant to outlast fashion cycles
            entirely.
          </p>
        </Reveal>
      </div>

      <div className="container-luxury mt-24 grid grid-cols-1 gap-10 sm:grid-cols-3">
        {[
          { stat: "13", label: "Years in tailoring" },
          { stat: "6", label: "Partner mills across Italy & Scotland" },
          { stat: "30-day", label: "No-questions returns" },
        ].map((item) => (
          <Reveal key={item.label} className="text-center">
            <p className="font-display text-5xl text-ink">{item.stat}</p>
            <p className="mt-3 font-sans text-sm text-ink-muted">{item.label}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
