"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addressSchema } from "@/lib/validations/schemas";
import type { Address } from "@/lib/types";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export default function AddressList({ addresses: initialAddresses }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove address.");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed.");
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && !showForm && (
        <p className="font-sans text-sm text-ink-muted">No saved addresses yet.</p>
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <li key={address.id} className="flex items-start justify-between gap-3 border border-border p-5">
            <div className="font-sans text-sm text-ink">
              <p className="font-medium">{address.full_name}</p>
              <p className="text-ink-muted">{address.line1}</p>
              {address.line2 && <p className="text-ink-muted">{address.line2}</p>}
              <p className="text-ink-muted">
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p className="text-ink-muted">{address.country}</p>
            </div>
            <button
              onClick={() => handleDelete(address.id)}
              aria-label={`Delete address for ${address.full_name}`}
              className="text-ink-muted hover:text-error"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {showForm ? (
        <NewAddressForm
          onCancel={() => setShowForm(false)}
          onSaved={(address) => {
            setAddresses((prev) => [...prev, address]);
            setShowForm(false);
          }}
        />
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)} className="w-fit">
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      )}
    </div>
  );
}

function NewAddressForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: (a: Address) => void }) {
  const [fields, setFields] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = addressSchema.safeParse({ ...fields, label: "Home" });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: "Home",
        full_name: parsed.data.fullName,
        line1: parsed.data.line1,
        line2: parsed.data.line2 || null,
        city: parsed.data.city,
        state: parsed.data.state || null,
        postal_code: parsed.data.postalCode,
        country: parsed.data.country,
        phone: parsed.data.phone || null,
      })
      .select("*")
      .single();

    setSubmitting(false);
    if (error || !data) {
      toast.error("Failed to save address.");
      return;
    }
    onSaved(data);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 border border-border p-5 sm:grid-cols-2">
      <input placeholder="Full name" value={fields.fullName} onChange={(e) => update("fullName", e.target.value)} className="input-luxury sm:col-span-2" required />
      <input placeholder="Address line 1" value={fields.line1} onChange={(e) => update("line1", e.target.value)} className="input-luxury sm:col-span-2" required />
      <input placeholder="Address line 2" value={fields.line2} onChange={(e) => update("line2", e.target.value)} className="input-luxury sm:col-span-2" />
      <input placeholder="City" value={fields.city} onChange={(e) => update("city", e.target.value)} className="input-luxury" required />
      <input placeholder="State" value={fields.state} onChange={(e) => update("state", e.target.value)} className="input-luxury" />
      <input placeholder="Postal code" value={fields.postalCode} onChange={(e) => update("postalCode", e.target.value)} className="input-luxury" required />
      <input placeholder="Country" value={fields.country} onChange={(e) => update("country", e.target.value)} className="input-luxury" required />
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" isLoading={submitting}>
          Save Address
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
