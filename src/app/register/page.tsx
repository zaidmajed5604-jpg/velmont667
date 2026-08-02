"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations/schemas";
import Button from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";
import { toast } from "sonner";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      agreeToTerms: agreeToTerms || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { full_name: parsed.data.fullName } },
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. Check your email to confirm your address.");
    router.push("/login");
  }

  return (
    <div className="container-luxury flex min-h-[70vh] items-center justify-center pb-section-sm pt-32">
      <Reveal className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-display text-display-sm font-normal text-ink">Create Account</h1>
          <p className="mt-3 font-sans text-sm text-ink-muted">Join VELMONT for a considered wardrobe</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="fullName" className="mb-2 block font-sans text-xs uppercase tracking-widest2 text-ink-muted">
              Full Name
            </label>
            <input
              id="fullName"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block font-sans text-xs uppercase tracking-widest2 text-ink-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block font-sans text-xs uppercase tracking-widest2 text-ink-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block font-sans text-xs uppercase tracking-widest2 text-ink-muted">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-luxury"
            />
          </div>
          <label className="flex items-start gap-3 font-sans text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 border-border accent-ink"
            />
            I agree to the{" "}
            <Link href="/terms" className="text-ink underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-4">
              Privacy Policy
            </Link>
          </label>
          <Button type="submit" isLoading={submitting} size="lg">
            Create Account
          </Button>
        </form>

        <p className="mt-8 text-center font-sans text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
