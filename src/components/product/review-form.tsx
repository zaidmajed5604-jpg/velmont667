"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { reviewSchema } from "@/lib/validations/schemas";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({ productId, rating, title: title || undefined, body });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete the review form.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.status === 401) {
        toast.error("Please sign in to leave a review.");
        return;
      }
      if (!res.ok) throw new Error();
      toast.success("Thank you — your review has been submitted.");
      setOpen(false);
      setRating(0);
      setTitle("");
      setBody("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary w-full">
        Write a Review
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 border border-border p-6">
      <div>
        <p className="mb-2 font-sans text-xs font-medium uppercase tracking-widest2 text-ink-muted">
          Your Rating
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  star <= (hoverRating || rating)
                    ? "fill-brown-dark text-brown-dark"
                    : "fill-transparent text-border-dark",
                )}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="input-luxury"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your experience with this piece…"
        rows={4}
        className="input-luxury resize-none"
        required
      />

      <div className="flex gap-3">
        <Button type="submit" isLoading={submitting}>
          Submit Review
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
