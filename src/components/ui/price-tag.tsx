import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface PriceTagProps {
  priceCents: number;
  compareAtPriceCents?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function PriceTag({
  priceCents,
  compareAtPriceCents,
  currency = "USD",
  size = "md",
  className,
}: PriceTagProps) {
  const onSale = Boolean(compareAtPriceCents && compareAtPriceCents > priceCents);
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";

  return (
    <div className={cn("flex items-baseline gap-2 font-sans", textSize, className)}>
      <span className={cn(onSale ? "text-error" : "text-ink")}>{formatPrice(priceCents, currency)}</span>
      {onSale && compareAtPriceCents && (
        <span className="text-ink-muted line-through opacity-60">
          {formatPrice(compareAtPriceCents, currency)}
        </span>
      )}
    </div>
  );
}
