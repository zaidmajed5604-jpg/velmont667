import type { Metadata } from "next";
import FaqAccordion from "@/components/legal/faq-accordion";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  {
    question: "How do I find my size?",
    answer:
      "Each product page includes a Size Guide with body measurements for that category. If you're between sizes, we generally recommend sizing up for tailoring and sizing down for knitwear.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of delivery for unworn items in original packaging. Visit our Returns page for full details.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes — we ship to most countries. International delivery takes 7–14 business days, and import duties are the recipient's responsibility.",
  },
  {
    question: "How do I care for cashmere and wool pieces?",
    answer:
      "Most tailoring and outerwear should be dry cleaned. Knitwear generally does best hand-washed in cold water and laid flat to dry. Specific care instructions are listed on every product page.",
  },
  {
    question: "Can I cancel or modify my order?",
    answer:
      "Orders can be modified or cancelled within 1 hour of placement — contact our concierge team as soon as possible at concierge@velmont.com.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Yes, complimentary gift wrapping is available at checkout for all orders.",
  },
  {
    question: "Where are your products made?",
    answer:
      "Our cloth is sourced from mills in Italy and Scotland, and garments are cut and constructed by our partner ateliers under the same standards we've held since our founding.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-luxury pb-section-sm pt-32 md:pb-section">
      <Reveal className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <span className="eyebrow">Support</span>
          <h1 className="mt-5 font-display text-display-lg font-normal text-ink">Frequently Asked Questions</h1>
        </div>
        <FaqAccordion items={FAQS} />
      </Reveal>
    </div>
  );
}
