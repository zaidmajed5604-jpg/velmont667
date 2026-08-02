"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SIZE_GUIDE } from "@/lib/constants";
import FocusTrap from "@/components/ui/focus-trap";

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  category: string;
}

export default function SizeGuideModal({ open, onClose, category }: SizeGuideModalProps) {
  const rows = category === "Tailoring" ? SIZE_GUIDE.Tailoring : SIZE_GUIDE.Standard;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-paper p-8"
          >
            <FocusTrap onEscape={onClose}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl text-ink">Size Guide</h2>
                <button onClick={onClose} aria-label="Close size guide">
                  <X className="h-5 w-5 text-ink" strokeWidth={1.5} />
                </button>
              </div>

              <table className="w-full font-sans text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-widest2 text-ink-muted">
                    <th className="pb-3 font-medium">Size</th>
                    <th className="pb-3 font-medium">Chest</th>
                    <th className="pb-3 font-medium">Waist</th>
                    <th className="pb-3 font-medium">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.size} className="border-b border-border/60 text-ink">
                      <td className="py-3 font-medium">{row.size}</td>
                      <td className="py-3 text-ink-muted">{row.chest}</td>
                      <td className="py-3 text-ink-muted">{row.waist}</td>
                      <td className="py-3 text-ink-muted">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-6 font-sans text-xs leading-relaxed text-ink-muted">
                Measurements are body measurements, not garment measurements. For a fit between two
                sizes, we recommend sizing up for tailoring and sizing down for knitwear.
              </p>
            </FocusTrap>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
