"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { newsletterSchema } from "@/lib/validations/schemas";
import { cn } from "@/lib/utils/cn";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p className={cn("font-sans text-sm text-brown-dark", compact ? "mt-5" : "mt-6")}>
        You&rsquo;re on the list. Welcome to {compact ? "VELMONT" : "the house"}.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2", compact ? "mt-5" : "mt-6")}>
      <div className="flex items-center border-b border-ink/40 focus-within:border-ink">
        <label htmlFor={compact ? "footer-newsletter-email" : "newsletter-email"} className="sr-only">
          Email address
        </label>
        <input
          id={compact ? "footer-newsletter-email" : "newsletter-email"}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full border-0 bg-transparent py-2.5 font-sans text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe"
          className="p-2 text-ink transition-transform hover:translate-x-0.5"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
      {error && <p className="font-sans text-xs text-error">{error}</p>}
    </form>
  );
}
