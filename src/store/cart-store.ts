"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  isDrawerOpen: boolean;
  addItem: (line: CartLine) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  subtotalCents: () => number;
  itemCount: () => number;
}

/**
 * Client-side cart state, persisted to localStorage for guests and mirrored
 * to the `carts` / `cart_items` tables server-side once a user is signed in
 * (see src/app/api/cart/route.ts). Kept in Zustand rather than fetched on
 * every render so the cart drawer opens instantly with zero network wait —
 * a "fast by default" requirement given the performance brief.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isDrawerOpen: false,

      addItem: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            const nextQty = Math.min(existing.quantity + line.quantity, existing.maxStock);
            return {
              lines: state.lines.map((l) =>
                l.variantId === line.variantId ? { ...l, quantity: nextQty } : l,
              ),
              isDrawerOpen: true,
            };
          }
          return { lines: [...state.lines, line], isDrawerOpen: true };
        }),

      removeItem: (variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.variantId === variantId
                ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxStock)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),

      clear: () => set({ lines: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      subtotalCents: () => get().lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0),
      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    {
      name: "velmont-cart",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);
