import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterSchema } from "@/lib/validations/schemas";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`newsletter:${ip}`, { limit: 5, windowSeconds: 60 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: parsed.data.email, is_active: true }, { onConflict: "email" });

  if (error) {
    console.error("[POST /api/newsletter]", error);
    return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
