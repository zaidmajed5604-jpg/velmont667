import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cartItemSchema } from "@/lib/validations/schemas";
import { z } from "zod";

/**
 * Server-persisted cart, used to restore a signed-in shopper's bag on a new
 * device. The client-side Zustand store (src/store/cart-store.ts) remains
 * the source of truth for rendering — this route exists purely to sync it,
 * so the UI never blocks on a network round-trip to show the cart.
 */

async function getOrCreateCart(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: existing } = await supabase.from("carts").select("id").eq("user_id", userId).single();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ lines: [] });

  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
  if (!cart) return NextResponse.json({ lines: [] });

  const { data: items } = await supabase
    .from("cart_items")
    .select("variant_id, quantity, product_variants(size, color, stock_quantity, products(id, slug, name, price_cents, product_images(url, display_order)))")
    .eq("cart_id", cart.id);

  return NextResponse.json({ items: items ?? [] });
}

const syncSchema = z.object({ lines: z.array(cartItemSchema) });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to sync your bag across devices." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart data." }, { status: 400 });
  }

  const cartId = await getOrCreateCart(supabase, user.id);

  // Replace the server-side cart wholesale with the client's current state —
  // simplest correct approach for a "last write wins" single-cart model.
  await supabase.from("cart_items").delete().eq("cart_id", cartId);

  if (parsed.data.lines.length > 0) {
    const { error } = await supabase.from("cart_items").insert(
      parsed.data.lines.map((line) => ({
        cart_id: cartId,
        variant_id: line.variantId,
        quantity: line.quantity,
      })),
    );
    if (error) {
      console.error("[POST /api/cart]", error);
      return NextResponse.json({ error: "Failed to sync bag." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
