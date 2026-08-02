"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import type { ProductWithDetails } from "@/lib/types";

export default function ProductDetailsAccordion({ product }: { product: ProductWithDetails }) {
  const items = [
    {
      value: "description",
      title: "Description",
      content: product.description,
    },
    {
      value: "materials",
      title: "Materials & Care",
      content: [product.material, product.care_instructions].filter(Boolean).join(". "),
    },
    {
      value: "shipping",
      title: "Shipping & Returns",
      content:
        "Complimentary shipping on orders over $200. Standard delivery arrives in 3–5 business days; express in 1–2. Returns are accepted within 30 days of delivery in original, unworn condition — see our full Returns policy for details.",
    },
  ].filter((item) => item.content);

  return (
    <Accordion.Root type="single" collapsible defaultValue="description" className="border-t border-border">
      {items.map((item) => (
        <Accordion.Item key={item.value} value={item.value} className="border-b border-border">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between py-5 text-left font-sans text-sm font-medium uppercase tracking-widest2 text-ink">
              {item.title}
              <ChevronDown className="h-4 w-4 text-ink-muted transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden pb-5 font-sans text-sm leading-relaxed text-ink-muted data-[state=open]:animate-fade-in">
            {item.content}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
