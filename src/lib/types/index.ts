import type { Database } from "@/lib/supabase/database.types";

export type { UserRole, OrderStatus, CouponType } from "@/lib/supabase/database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Collection = Database["public"]["Tables"]["collections"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

/** A product enriched with its images and variants — the shape returned by product queries. */
export interface ProductWithDetails extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  collection?: Pick<Collection, "id" | "name" | "slug"> | null;
}

/** A review joined with the reviewer's display name. */
export interface ReviewWithAuthor extends Review {
  author_name: string;
}

/** Line item in the client-side cart store — deliberately denormalized so the cart renders instantly without a fetch. */
export interface CartLine {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  size: string;
  color: string;
  unitPriceCents: number;
  quantity: number;
  imageUrl: string;
  maxStock: number;
}

export interface ShippingAddressInput {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= threshold) return "low-stock";
  return "in-stock";
}
