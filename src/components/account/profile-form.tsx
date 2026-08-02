"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileFormProps {
  initialFullName: string;
  initialPhone: string;
  email: string;
}

export default function ProfileForm({ initialFullName, initialPhone, email }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", user.id);

    setSubmitting(false);
    if (error) {
      toast.error("Failed to update profile.");
      return;
    }
    toast.success("Profile updated.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block font-sans text-xs uppercase tracking-widest2 text-ink-muted">Email</label>
        <input value={email} disabled className="input-luxury opacity-60" />
      </div>
      <div>
        <label className="mb-2 block font-sans text-xs uppercase tracking-widest2 text-ink-muted">Full Name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-luxury" />
      </div>
      <div>
        <label className="mb-2 block font-sans text-xs uppercase tracking-widest2 text-ink-muted">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-luxury" />
      </div>
      <Button type="submit" isLoading={submitting} className="w-fit">
        Save Changes
      </Button>
    </form>
  );
}
