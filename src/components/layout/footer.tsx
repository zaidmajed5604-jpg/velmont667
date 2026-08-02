import Link from "next/link";
import { SITE_NAME, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import NewsletterForm from "@/components/home/newsletter-form";
import RegionSelector from "@/components/layout/region-selector";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-ivory">
      <div className="container-luxury py-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_1fr]">
          <div>
            <span className="font-display text-3xl tracking-widest3 text-ink">{SITE_NAME}</span>
            <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-ink-muted">
              Considered menswear for a quieter kind of luxury — tailoring, outerwear, and knitwear made
              to be worn for decades, not seasons.
            </p>
            <div className="mt-6 flex gap-5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xs uppercase tracking-widest2 text-ink-muted transition-colors hover:text-ink"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-sans text-xs font-medium uppercase tracking-widest2 text-ink">{heading}</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-sans text-xs font-medium uppercase tracking-widest2 text-ink">Newsletter</h3>
            <p className="mt-5 font-sans text-sm text-ink-muted">
              Early access to new arrivals and limited runs.
            </p>
            <NewsletterForm compact />
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="font-sans text-xs text-ink-muted">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <RegionSelector />
        </div>
      </div>
    </footer>
  );
}
