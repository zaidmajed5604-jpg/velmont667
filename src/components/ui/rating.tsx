import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}

/** Read-only star rating display used on product cards and the product page. */
export default function Rating({ value, count, size = "sm", showCount = true, className }: RatingProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={cn("flex items-center gap-1.5", className)} role="img" aria-label={`Rated ${value} out of 5 stars`}>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.round(value) ? "fill-brown-dark text-brown-dark" : "fill-transparent text-border-dark",
            )}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="font-sans text-xs text-ink-muted">({count})</span>
      )}
    </div>
  );
}
