"use client";

import { useState } from "react";
import { contactFormSchema } from "@/lib/validations/schemas";
import Button from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactFormSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-luxury pb-section-sm pt-32 md:pb-section">
      <Reveal className="mb-16 text-center">
        <span className="eyebrow">Get in Touch</span>
        <h1 className="mt-5 font-display text-display-lg font-normal text-ink">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-md font-sans text-[15px] text-ink-muted">
          Our concierge team is here for sizing advice, order questions, or anything else.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <Mail className="h-5 w-5 shrink-0 text-brown-dark" strokeWidth={1.5} />
            <div>
              <p className="font-sans text-sm font-medium text-ink">Email</p>
              <p className="font-sans text-sm text-ink-muted">concierge@velmont.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="h-5 w-5 shrink-0 text-brown-dark" strokeWidth={1.5} />
            <div>
              <p className="font-sans text-sm font-medium text-ink">Phone</p>
              <p className="font-sans text-sm text-ink-muted">+1 (212) 555-0148</p>
              <p className="font-sans text-xs text-ink-muted">Mon–Fri, 9am–6pm ET</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 shrink-0 text-brown-dark" strokeWidth={1.5} />
            <div>
              <p className="font-sans text-sm font-medium text-ink">Atelier</p>
              <p className="font-sans text-sm text-ink-muted">21 Mercer Street, New York, NY 10013</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {sent ? (
            <div className="border border-success/30 bg-success/5 p-8 text-center">
              <p className="font-display text-xl text-ink">Message received</p>
              <p className="mt-2 font-sans text-sm text-ink-muted">
                Thank you for reaching out — our team will respond within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input-luxury"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="input-luxury"
                  required
                />
              </div>
              <input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                className="input-luxury"
                required
              />
              <textarea
                placeholder="How can we help?"
                rows={6}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="input-luxury resize-none"
                required
              />
              <Button type="submit" isLoading={submitting} className="w-fit">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
