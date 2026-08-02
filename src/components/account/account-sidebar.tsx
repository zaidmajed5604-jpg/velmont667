"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
];

export default function AccountSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside>
      <p className="font-display text-2xl text-ink">{name}</p>
      <nav className="mt-8 flex flex-row gap-6 border-b border-border pb-4 lg:flex-col lg:gap-3 lg:border-0 lg:pb-0">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "font-sans text-sm transition-colors",
              pathname === link.href ? "text-ink underline underline-offset-4" : "text-ink-muted hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="text-left font-sans text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Sign Out
        </button>
      </nav>
    </aside>
  );
}
