"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/schemas";
import Button from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";
import { toast } from "sonner";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setSubmitting(false);

    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
      return;
    }

    router.push(searchParams.get("redirect") || "/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-luxury"
        />
      </div>
      <Button type="submit" isLoading={submitting} size="lg">
        Sign In
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="container-luxury flex min-h-[70vh] items-center justify-center pb-section-sm pt-32">
      <Reveal className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-display text-display-sm font-normal text-ink">Welcome Back</h1>
          <p className="mt-3 font-sans text-sm text-ink-muted">Sign in to your VELMONT account</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="mt-8 text-center font-sans text-sm text-ink-muted">
          New here?{" "}
          <Link href="/register" className="text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
