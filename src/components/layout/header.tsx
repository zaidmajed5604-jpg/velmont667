"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search, ShoppingBag, User, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, MEGA_MENU_SECTIONS, SITE_NAME } from "@/lib/constants";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import MobileMenu from "@/components/layout/mobile-menu";
import SearchOverlay from "@/components/layout/search-overlay";
import { cn } from "@/lib/utils/cn";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openDrawer);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  // The cart/wishlist counts come from localStorage, which the server can't
  // see during SSR — it always renders 0. Rendering the real count only
  // after mount keeps the server and first-client-render HTML identical
  // (both show no badge), avoiding a hydration mismatch, then the badge
  // appears a moment later once the client has read localStorage.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isHome = pathname === "/";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent-over-hero only applies on the homepage, at the very top.
  const isTransparent = isHome && !scrolled && !megaMenuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-luxury",
          isTransparent ? "bg-transparent" : "bg-ivory/95 shadow-soft backdrop-blur-md",
        )}
        onMouseLeave={() => setMegaMenuOpen(false)}
      >
        <div className="container-luxury flex h-20 items-center justify-between">
          <button
            className="flex items-center justify-center lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className={cn("h-6 w-6", isTransparent ? "text-ivory" : "text-ink")} strokeWidth={1.5} />
          </button>

          <nav className="hidden items-center gap-8 lg:flex" onMouseEnter={() => setMegaMenuOpen(true)}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-sans text-[13px] font-medium uppercase tracking-widest2 transition-colors duration-300",
                  isTransparent ? "text-ivory hover:text-ivory/70" : "text-ink hover:text-brown-dark",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className={cn(
              "absolute left-1/2 -translate-x-1/2 font-display text-2xl font-medium tracking-widest3 transition-colors duration-300",
              isTransparent ? "text-ivory" : "text-ink",
            )}
          >
            {SITE_NAME}
          </Link>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={cn("transition-colors duration-300", isTransparent ? "text-ivory" : "text-ink")}
            >
              <Search className="h-[19px] w-[19px]" strokeWidth={1.5} />
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className={cn("hidden transition-colors duration-300 sm:block", isTransparent ? "text-ivory" : "text-ink")}
            >
              <User className="h-[19px] w-[19px]" strokeWidth={1.5} />
            </Link>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${mounted ? wishlistCount : 0} items`}
              className={cn("relative transition-colors duration-300", isTransparent ? "text-ivory" : "text-ink")}
            >
              <Heart className="h-[19px] w-[19px]" strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brown-dark text-[10px] text-ivory">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={openCart}
              aria-label={`Shopping bag, ${mounted ? itemCount : 0} items`}
              className={cn("relative transition-colors duration-300", isTransparent ? "text-ivory" : "text-ink")}
            >
              <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.5} />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brown-dark text-[10px] text-ivory">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {megaMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-border/60 bg-ivory shadow-soft"
            >
              <div className="container-luxury grid grid-cols-4 gap-10 py-10">
                {MEGA_MENU_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <Link
                      href={section.href}
                      className="font-display text-lg text-ink hover:text-brown-dark"
                      onClick={() => setMegaMenuOpen(false)}
                    >
                      {section.title}
                    </Link>
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {section.items.map((item) => (
                        <li key={item}>
                          <Link
                            href={`${section.href}&subcategory=${encodeURIComponent(item)}`}
                            className="font-sans text-sm text-ink-muted transition-colors hover:text-ink"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
