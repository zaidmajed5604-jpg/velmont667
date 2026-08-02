import Hero from "@/components/home/hero";
import FeaturedCollection from "@/components/home/featured-collection";
import ProductRail from "@/components/home/product-rail";
import OurStory from "@/components/home/our-story";
import NewsletterSection from "@/components/home/newsletter-section";
import InstagramGallery from "@/components/home/instagram-gallery";
import { getFeaturedCollection } from "@/lib/data/collections";
import { getNewArrivals, getBestSellers } from "@/lib/data/products";

// Revalidate the homepage every hour — product data changes rarely enough
// that we don't need per-request freshness, and this keeps TTFB near-zero.
export const revalidate = 3600;

export default async function HomePage() {
  const [featuredCollection, newArrivals, bestSellers] = await Promise.all([
    getFeaturedCollection(),
    getNewArrivals(4),
    getBestSellers(4),
  ]);

  return (
    <>
      <Hero />
      {featuredCollection && <FeaturedCollection collection={featuredCollection} />}
      <ProductRail
        eyebrow="Just In"
        title="New Arrivals"
        description="The newest additions to the wardrobe, cut from this season's cloth."
        products={newArrivals}
        viewAllHref="/shop?filter=new"
      />
      <OurStory />
      <ProductRail
        eyebrow="Most Considered"
        title="Best Sellers"
        description="The pieces our clients return for, year after year."
        products={bestSellers}
        viewAllHref="/shop?filter=best-sellers"
      />
      <NewsletterSection />
      <InstagramGallery />
    </>
  );
}
