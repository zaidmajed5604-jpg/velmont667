import Reveal from "@/components/ui/reveal";
import NewsletterForm from "@/components/home/newsletter-form";

export default function NewsletterSection() {
  return (
    <section className="border-y border-border bg-ink">
      <div className="container-luxury flex flex-col items-center py-20 text-center md:py-28">
        <Reveal>
          <span className="font-sans text-xs font-medium uppercase tracking-widest3 text-ivory/60">
            Join the House
          </span>
          <h2 className="mt-5 max-w-xl text-balance font-display text-display-md font-normal text-ivory">
            Be first to know
          </h2>
          <p className="mx-auto mt-4 max-w-md font-sans text-[15px] leading-relaxed text-ivory/70">
            Early access to new arrivals, limited runs, and the occasional note from the atelier.
          </p>
          <div className="mx-auto mt-8 max-w-sm">
            <NewsletterFormDark />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Dark-background variant of the newsletter form for the homepage band. */
function NewsletterFormDark() {
  return (
    <div className="[&_input]:text-ivory [&_input::placeholder]:text-ivory/50 [&_button]:text-ivory [&_div]:border-ivory/40 [&_p]:text-ivory/70">
      <NewsletterForm />
    </div>
  );
}
