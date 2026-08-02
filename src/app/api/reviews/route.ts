import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations/schemas";

/** POST /api/reviews — submit a review. Requires auth; one review per product per user (enforced by DB unique constraint). */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to leave a review." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review." }, { status: 400 });
  }

  // A review only counts as "verified purchase" if the user has a delivered
  // order containing this product — check before insert.
  const { count: purchaseCount } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id, status)", { count: "exact", head: true })
    .eq("product_id", parsed.data.productId)
    .eq("orders.user_id", user.id)
    .in("orders.status", ["delivered", "shipped"]);

  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title ?? null,
    body: parsed.data.body,
    is_verified_purchase: (purchaseCount ?? 0) > 0,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You've already reviewed this product." }, { status: 409 });
    }
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
