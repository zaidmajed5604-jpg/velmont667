import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/account/profile-form";
import AddressList from "@/components/account/address-list";
import type { Profile, Address } from "@/lib/types";

export const metadata = { title: "My Account" };

export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = (await supabase.from("profiles").select("*").eq("id", user!.id).single()) as {
    data: Profile | null;
  };
  const { data: addresses } = (await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user!.id)
    .order("is_default", { ascending: false })) as { data: Address[] | null };

  return (
    <div className="flex flex-col gap-16">
      <section>
        <h1 className="font-display text-display-sm font-normal text-ink">Account Overview</h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">Manage your profile details.</p>
        <div className="mt-8 max-w-md">
          <ProfileForm
            initialFullName={profile?.full_name ?? ""}
            initialPhone={profile?.phone ?? ""}
            email={user!.email ?? ""}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-normal text-ink">Saved Addresses</h2>
        <div className="mt-6">
          <AddressList addresses={addresses ?? []} />
        </div>
      </section>
    </div>
  );
}
