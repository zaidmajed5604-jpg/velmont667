import type { ReactNode } from "react";
import Reveal from "@/components/ui/reveal";

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  updatedAt?: string;
  children: ReactNode;
}

export default function LegalPageLayout({ eyebrow, title, updatedAt, children }: LegalPageLayoutProps) {
  return (
    <div className="container-luxury pb-section-sm pt-32 md:pb-section">
      <Reveal className="mx-auto max-w-2xl">
        <div className="mb-12 border-b border-border pb-8">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-5 font-display text-display-md font-normal text-ink">{title}</h1>
          {updatedAt && <p className="mt-3 font-sans text-xs text-ink-muted">Last updated {updatedAt}</p>}
        </div>
        <div className="prose prose-neutral max-w-none font-sans text-[15px] leading-relaxed text-ink-muted [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-ink [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </Reveal>
    </div>
  );
}
