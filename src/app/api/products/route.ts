import { NextResponse, type NextRequest } from "next/server";
import { getProducts, getProductsByIds } from "@/lib/data/products";

/**
 * GET /api/products
 *   ?ids=uuid,uuid          — batch lookup (used by Recently Viewed)
 *   ?search=query           — full-text search (used by the search overlay)
 *   ?category=Outerwear      — filter by category
 *   ?filter=new|best-sellers
 *   ?sort=price-asc|price-desc|newest|rating
 *   ?page=1&pageSize=24
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  try {
    if (ids) {
      const products = await getProductsByIds(ids.split(",").filter(Boolean));
      return NextResponse.json({ products });
    }

    const result = await getProducts({
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      filter: (searchParams.get("filter") as "new" | "best-sellers" | null) ?? undefined,
      sort: (searchParams.get("sort") as "price-asc" | "price-desc" | "newest" | "rating" | null) ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? "24"),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  }
}
