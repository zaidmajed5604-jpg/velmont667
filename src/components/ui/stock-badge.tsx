import { cn } from "@/lib/utils/cn";
import type { StockStatus } from "@/lib/types";

const CONFIG: Record<StockStatus, { label: string; className: string }> = {
  "in-stock": { label: "In Stock", className: "text-success" },
  "low-stock": { label: "Almost Gone", className: "text-error" },
  "out-of-stock": { label: "Out of Stock", className: "text-ink-muted" },
};

export default function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  const { label, className: colorClass } = CONFIG[status];
  return (
    <span className={cn("font-sans text-xs font-medium tracking-wide", colorClass, className)}>
      <span
        className={cn(
          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
          status === "in-stock" && "bg-success",
          status === "low-stock" && "bg-error",
          status === "out-of-stock" && "bg-ink-muted",
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
