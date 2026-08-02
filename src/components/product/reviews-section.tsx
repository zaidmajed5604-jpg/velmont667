import type { ProductWithDetails, ReviewWithAuthor } from "@/lib/types";
import Rating from "@/components/ui/rating";
import { formatDate } from "@/lib/utils/format";
import ReviewForm from "@/components/product/review-form";
import Reveal from "@/components/ui/reveal";

interface ReviewsSectionProps {
  product: ProductWithDetails;
  reviews: ReviewWithAuthor[];
}

export default function ReviewsSection({ product, reviews }: ReviewsSectionProps) {
  return (
    <section className="border-t border-border py-section-sm">
      <div className="container-luxury">
        <Reveal className="flex flex-col items-center text-center">
          <span className="eyebrow">Reviews</span>
          <h2 className="mt-5 font-display text-display-sm font-normal text-ink">What Clients Say</h2>
          {product.rating_count > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <Rating value={product.rating_average} size="md" showCount={false} />
              <span className="font-sans text-sm text-ink-muted">
                {product.rating_average.toFixed(1)} out of 5 ({product.rating_count} reviews)
              </span>
            </div>
          )}
        </Reveal>

        <div className="mx-auto mt-12 max-w-2xl">
          <ReviewForm productId={product.id} />

          {reviews.length === 0 ? (
            <p className="mt-8 text-center font-sans text-sm text-ink-muted">
              No reviews yet — be the first to share your thoughts.
            </p>
          ) : (
            <ul className="mt-8 flex flex-col divide-y divide-border">
              {reviews.map((review) => (
                <li key={review.id} className="py-6">
                  <div className="flex items-center justify-between">
                    <Rating value={review.rating} showCount={false} />
                    <span className="font-sans text-xs text-ink-muted">{formatDate(review.created_at)}</span>
                  </div>
                  {review.title && <p className="mt-3 font-display text-lg text-ink">{review.title}</p>}
                  <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">{review.body}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-sans text-xs font-medium text-ink">{review.author_name}</span>
                    {review.is_verified_purchase && (
                      <span className="font-sans text-xs text-success">Verified Purchase</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
