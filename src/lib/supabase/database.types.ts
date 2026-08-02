/**
 * Hand-authored types mirroring supabase/migrations/0001_init.sql.
 *
 * In production, regenerate this file from the live schema with:
 *   npm run db:types
 * which runs `supabase gen types typescript` against your project.
 * Keeping a hand-authored baseline here means the app builds correctly
 * even before a Supabase project has been provisioned.
 */

export type UserRole = "customer" | "staff" | "admin";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type CouponType = "percentage" | "fixed_amount" | "free_shipping";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string | null;
          postal_code: string;
          country: string;
          phone: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["addresses"]["Row"]> & {
          user_id: string;
          full_name: string;
          line1: string;
          city: string;
          postal_code: string;
          country: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Row"]>;
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          hero_image_url: string | null;
          is_featured: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["collections"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["collections"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          sku: string;
          slug: string;
          name: string;
          description: string;
          care_instructions: string | null;
          material: string | null;
          price_cents: number;
          compare_at_price_cents: number | null;
          currency: string;
          collection_id: string | null;
          category: string;
          is_new_arrival: boolean;
          is_best_seller: boolean;
          is_published: boolean;
          rating_average: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          sku: string;
          slug: string;
          name: string;
          price_cents: number;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string;
          display_order: number;
          is_hover_image: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]> & {
          product_id: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          color_hex: string | null;
          sku_suffix: string;
          stock_quantity: number;
          low_stock_threshold: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_variants"]["Row"]> & {
          product_id: string;
          size: string;
          color: string;
          sku_suffix: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          body: string;
          is_verified_purchase: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          product_id: string;
          user_id: string;
          rating: number;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
        Relationships: [];
      };
      wishlist_items: {
        Row: { id: string; user_id: string; product_id: string; created_at: string };
        Insert: { user_id: string; product_id: string };
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Row"]>;
        Relationships: [];
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["carts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["carts"]["Row"]>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cart_items"]["Row"]> & {
          cart_id: string;
          variant_id: string;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Row"]>;
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: CouponType;
          value_cents: number | null;
          percentage: number | null;
          min_subtotal_cents: number;
          max_redemptions: number | null;
          times_redeemed: number;
          is_active: boolean;
          starts_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["coupons"]["Row"]> & { code: string; type: CouponType };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          status: OrderStatus;
          email: string;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown>;
          subtotal_cents: number;
          shipping_cents: number;
          tax_cents: number;
          discount_cents: number;
          total_cents: number;
          currency: string;
          coupon_code: string | null;
          stripe_payment_intent_id: string | null;
          tracking_number: string | null;
          tracking_carrier: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          order_number: string;
          email: string;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown>;
          subtotal_cents: number;
          total_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          size: string;
          color: string;
          unit_price_cents: number;
          quantity: number;
          image_url: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          size: string;
          color: string;
          unit_price_cents: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: { id: string; email: string; subscribed_at: string; is_active: boolean };
        Insert: { email: string };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Row"]>;
        Relationships: [];
      };
      pending_checkouts: {
        Row: {
          id: string;
          stripe_payment_intent_id: string;
          email: string;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown>;
          lines: { variantId: string; quantity: number }[];
          shipping_cents: number;
          tax_cents: number;
          discount_cents: number;
          coupon_code: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pending_checkouts"]["Row"]> & {
          stripe_payment_intent_id: string;
          email: string;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown>;
          lines: { variantId: string; quantity: number }[];
        };
        Update: Partial<Database["public"]["Tables"]["pending_checkouts"]["Row"]>;
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          is_resolved: boolean;
          created_at: string;
        };
        Insert: { name: string; email: string; subject: string; message: string };
        Update: Partial<Database["public"]["Tables"]["contact_submissions"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order: {
        Args: {
          p_order_number: string;
          p_user_id: string | null;
          p_email: string;
          p_shipping_address: Record<string, unknown>;
          p_billing_address: Record<string, unknown>;
          p_lines: { variant_id: string; quantity: number }[];
          p_shipping_cents: number;
          p_tax_cents: number;
          p_discount_cents: number;
          p_coupon_code: string | null;
          p_stripe_payment_intent_id: string | null;
        };
        Returns: string;
      };
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      coupon_type: CouponType;
    };
    CompositeTypes: Record<string, never>;
  };
}
