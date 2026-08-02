"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENTLY_VIEWED = 8;

interface RecentlyViewedState {
  productIds: string[];
  record: (productId: string) => void;
}

/** Tracks the last N product ids viewed, most-recent-first, for the "Recently Viewed" rail. */
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      productIds: [],
      record: (productId) =>
        set(() => {
          const withoutCurrent = get().productIds.filter((id) => id !== productId);
          return { productIds: [productId, ...withoutCurrent].slice(0, MAX_RECENTLY_VIEWED) };
        }),
    }),
    { name: "velmont-recently-viewed" },
  ),
);
