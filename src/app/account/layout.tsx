import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountSidebar from "@/components/account/account-sidebar";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Profile | null;

  return (
    <div className="container-luxury grid grid-cols-1 gap-12 pb-section-sm pt-32 lg:grid-cols-[240px_1fr]">
      <AccountSidebar
        name={typedProfile?.full_name ?? user.email ?? "Account"}
      />
      <div>{children}</div>
    </div>
  );
}