"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
  variant?: "floating" | "inline";
}

export default function WishlistButton({
  productId,
  productName,
  className,
  variant = "floating",
}: WishlistButtonProps) {
  const isSaved = useWishlistStore((s) => s.has(productId));
  const toggle = useWishlistStore((s) => s.toggle);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    toast(isSaved ? `Removed ${productName} from wishlist` : `Saved ${productName} to wishlist`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={cn(
        "group/wish flex items-center justify-center transition-transform duration-300 hover:scale-110",
        variant === "floating" &&
          "absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-paper/90 shadow-soft backdrop-blur-sm",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors duration-300",
          isSaved ? "fill-brown-dark text-brown-dark" : "fill-transparent text-ink group-hover/wish:text-brown-dark",
        )}
        strokeWidth={1.5}
      />
    </button>
  );
}
