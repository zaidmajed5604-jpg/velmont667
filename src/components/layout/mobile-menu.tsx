"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import FocusTrap from "@/components/ui/focus-trap";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-ivory p-8 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <FocusTrap onEscape={onClose}>
              <div className="mb-12 flex items-center justify-between">
                <span className="font-display text-2xl tracking-widest3 text-ink">{SITE_NAME}</span>
                <button onClick={onClose} aria-label="Close menu">
                  <X className="h-6 w-6 text-ink" strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="font-display text-2xl font-normal text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8">
                <Link href="/account" onClick={onClose} className="font-sans text-sm text-ink-muted">
                  My Account
                </Link>
                <Link href="/contact" onClick={onClose} className="font-sans text-sm text-ink-muted">
                  Contact Us
                </Link>
              </div>
            </FocusTrap>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
