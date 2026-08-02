import { NextResponse, type NextRequest } from "next/server";
import { contactFormSchema } from "@/lib/validations/schemas";
import { rateLimit } from "@/lib/utils/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/contact
 * Stores the inquiry and (in production) emails it via Resend — wire up
 * RESEND_API_KEY and uncomment the send call below to activate outbound
 * email; the form works end-to-end without it, it just won't notify staff.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`contact:${ip}`, { limit: 5, windowSeconds: 300 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const parsed = contactFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid form data." }, { status: 400 });
  }

  // if (process.env.RESEND_API_KEY) {
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: "VELMONT <concierge@velmont.com>",
  //     to: "support@velmont.com",
  //     replyTo: parsed.data.email,
  //     subject: `[Contact] ${parsed.data.subject}`,
  //     text: parsed.data.message,
  //   });
  // }

  const admin = createAdminClient();
  const { error } = await admin.from("contact_submissions").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json({ error: "Failed to send your message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
