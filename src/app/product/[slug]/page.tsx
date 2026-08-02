import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { getProductBySlug, getRecommendedProducts } from "@/lib/data/products";
import { getProductReviews } from "@/lib/data/reviews";
import ProductGallery from "@/components/product/product-gallery";
import AddToCartForm from "@/components/product/add-to-cart-form";
import ProductDetailsAccordion from "@/components/product/product-details-accordion";
import ReviewsSection from "@/components/product/reviews-section";
import RecommendedProducts from "@/components/product/recommended-products";
import RecentlyViewed from "@/components/product/recently-viewed";
import Rating from "@/components/ui/rating";
import PriceTag from "@/components/ui/price-tag";
import WishlistButton from "@/components/product/wishlist-button";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const primaryImage = product.images[0];

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: primaryImage ? [{ url: primaryImage.url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, recommended] = await Promise.all([
    getProductReviews(product.id),
    getRecommendedProducts(product.id, product.category),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.price_cents / 100).toFixed(2),
      availability: product.variants.some((v) => v.stock_quantity > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.rating_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating_average,
        reviewCount: product.rating_count,
      },
    }),
  };

  return (
    <div className="pt-32">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-luxury">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-sans text-xs text-ink-muted">
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-ink">
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-start justify-between gap-4">
              <div>
                {product.collection && (
                  <Link
                    href={`/collections/${product.collection.slug}`}
                    className="font-sans text-xs font-medium uppercase tracking-widest2 text-brown"
                  >
                    {product.collection.name}
                  </Link>
                )}
                <h1 className="mt-2 font-display text-display-sm font-normal text-ink md:text-display-md">
                  {product.name}
                </h1>
              </div>
              <WishlistButton
                productId={product.id}
                productName={product.name}
                variant="inline"
                className="mt-3 h-9 w-9 border border-border"
              />
            </div>

            {product.rating_count > 0 && (
              <div className="mt-3">
                <Rating value={product.rating_average} count={product.rating_count} />
              </div>
            )}

            <div className="mt-5">
              <PriceTag
                priceCents={product.price_cents}
                compareAtPriceCents={product.compare_at_price_cents}
                currency={product.currency}
                size="lg"
              />
            </div>

            <p className="mt-6 max-w-md font-sans text-[15px] leading-relaxed text-ink-muted">
              {product.description}
            </p>

            <div className="mt-8">
              <AddToCartForm product={product} />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 shrink-0 text-brown-dark" strokeWidth={1.5} />
                <p className="font-sans text-xs text-ink-muted">Free shipping over $200</p>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 shrink-0 text-brown-dark" strokeWidth={1.5} />
                <p className="font-sans text-xs text-ink-muted">30-day returns</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-brown-dark" strokeWidth={1.5} />
                <p className="font-sans text-xs text-ink-muted">Secure checkout</p>
              </div>
            </div>

            <div className="mt-8">
              <ProductDetailsAccordion product={product} />
            </div>
          </div>
        </div>
      </div>

      <ReviewsSection product={product} reviews={reviews} />
      <RecommendedProducts products={recommended} />
      <RecentlyViewed currentProductId={product.id} />
    </div>
  );
}
