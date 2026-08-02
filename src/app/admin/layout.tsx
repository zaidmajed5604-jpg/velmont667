import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import AdminSignOut from "@/components/admin/admin-sign-out";

const ADMIN_LINKS = [
  { label: "Overview", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Coupons", href: "/admin/coupons" },
  { label: "Analytics", href: "/admin/analytics" },
];

// Middleware (src/middleware.ts) already redirects non-staff users away
// from /admin/** before this layout ever renders.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ivory font-sans">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-paper px-6 py-8 lg:flex">
        <Link href="/" className="font-display text-2xl tracking-widest3 text-ink">
          {SITE_NAME}
        </Link>
        <p className="mt-1 font-sans text-xs uppercase tracking-widest2 text-ink-muted">Admin</p>

        <nav className="mt-10 flex flex-col gap-1">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-3 py-2 font-sans text-sm text-ink-muted transition-colors hover:bg-beige-light hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
          <Link href="/" className="font-sans text-xs text-ink-muted hover:text-ink">
            ← Back to Store
          </Link>
          <AdminSignOut />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
