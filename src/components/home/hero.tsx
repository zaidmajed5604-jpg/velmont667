"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Full-viewport hero. The background image parallaxes slightly slower than
 * scroll (a subtle, "considered" motion — not the aggressive layered
 * parallax of a template site), and the headline draws in on load with a
 * hairline underline signature that echoes the wordmark treatment used
 * site-wide.
 */
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[100svh] w-full overflow-hidden bg-ink">
      <motion.div style={{ y: imageY }} className="absolute inset-0 h-[120%]">
        <Image
          src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2400"
          alt="A model in a tailored wool overcoat, standing in soft morning light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/30" />
      </motion.div>

      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-xs font-medium uppercase tracking-widest3 text-ivory/80"
        >
          Autumn / Winter Collection
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-3xl text-balance font-display text-5xl font-normal italic leading-[1.1] text-ivory sm:text-display-xl"
        >
          Dressed for a life <br className="hidden sm:block" /> well considered
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 1, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 h-px bg-ivory/50"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-8 max-w-md font-sans text-[15px] leading-relaxed text-ivory/85"
        >
          Tailoring, outerwear, and knitwear made from archive-grade cloth, cut to be worn
          for decades rather than seasons.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link href="/shop" className="btn-primary bg-ivory text-ink hover:bg-ivory/90">
            Shop the Collection
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 rounded-pill border border-ivory/60 px-8 py-3.5 font-sans text-sm font-medium tracking-wide text-ivory transition-all duration-400 ease-luxury hover:border-ivory hover:bg-ivory/10"
          >
            Our Story
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <ChevronDown className="h-5 w-5 animate-bounce text-ivory/70" strokeWidth={1.5} />
      </motion.div>
    </section>
  );
}
