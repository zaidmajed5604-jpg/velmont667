import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ productIds: [] });

  const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id);
  return NextResponse.json({ productIds: (data ?? []).map((row) => row.product_id) });
}

const toggleSchema = z.object({ productId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to save items across devices." }, { status: 401 });
  }

  const parsed = toggleSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid product." }, { status: 400 });

  const { error } = await supabase
    .from("wishlist_items")
    .upsert({ user_id: user.id, product_id: parsed.data.productId }, { onConflict: "user_id,product_id" });

  if (error) return NextResponse.json({ error: "Failed to save item." }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing productId." }, { status: 400 });

  await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
  return NextResponse.json({ success: true });
}
