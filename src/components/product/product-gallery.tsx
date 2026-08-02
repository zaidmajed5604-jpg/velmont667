"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/lib/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * Large product gallery with a thumbnail rail and cursor-following zoom on
 * the active image (desktop) — the zoom is a CSS background-position trick
 * rather than swapping to a huge image, so it stays fast.
 */
export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const active = images[activeIndex];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }

  if (!active) {
    return <div className="aspect-[4/5] w-full bg-beige-light" />;
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            aria-label={`View image ${i + 1} of ${productName}`}
            aria-current={i === activeIndex}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden border transition-colors md:h-24 md:w-20",
              i === activeIndex ? "border-ink" : "border-transparent opacity-70 hover:opacity-100",
            )}
          >
            <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>

      <div
        ref={imageRef}
        className="relative aspect-[4/5] w-full flex-1 cursor-zoom-in overflow-hidden bg-beige-light"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
      >
        <Image
          src={active.url}
          alt={active.alt_text || productName}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className={cn("object-cover transition-transform duration-200 ease-out", isZooming && "scale-[1.8]")}
          style={isZooming ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
        />
      </div>
    </div>
  );
}
