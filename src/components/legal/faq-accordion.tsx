"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  items: { question: string; answer: string }[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <Accordion.Root type="single" collapsible className="border-t border-border">
      {items.map((item, i) => (
        <Accordion.Item key={i} value={`item-${i}`} className="border-b border-border">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between py-6 text-left font-display text-lg font-normal text-ink">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden pb-6 font-sans text-[15px] leading-relaxed text-ink-muted data-[state=open]:animate-fade-in">
            {item.answer}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
