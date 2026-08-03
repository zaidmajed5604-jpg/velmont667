import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/legal-page-layout";

export const metadata: Metadata = { title: "Care Guide" };

export default function CareGuidePage() {
  return (
    <LegalPageLayout eyebrow="Support" title="Care Guide">
      <p>
        Every VELMONT piece is made from natural fibers chosen for how they age, not just how
        they look new. A little care goes a long way toward keeping them in the rotation for
        years, not seasons.
      </p>

      <h2>Wool Tailoring &amp; Outerwear</h2>
      <p>
        Dry clean only, and sparingly — over-cleaning breaks down wool fibers faster than wear
        does. Between cleans, hang on a wide-shouldered hanger and let the garment rest for a day
        after wearing before returning it to the closet. Use a clothes brush to lift surface dust
        and refresh the nap.
      </p>

      <h2>Cashmere &amp; Fine Knitwear</h2>
      <p>
        Hand wash cold in a wool-safe detergent, or dry clean. Never wring — press water out
        gently and lay flat on a towel to dry, reshaping while damp. Store folded, never on a
        hanger, to avoid stretching at the shoulders. A cashmere comb removes pilling without
        damaging the fiber.
      </p>

      <h2>Cotton Shirting</h2>
      <p>
        Machine wash cold with similar colors, and hang dry when possible to preserve the collar
        structure. If ironing, do so while slightly damp for the cleanest finish.
      </p>

      <h2>Leather Goods</h2>
      <p>
        Wipe clean with a soft, dry cloth. Condition every six months with a leather balm to
        prevent cracking, and keep away from prolonged direct sun and moisture.
      </p>

      <h2>Storage</h2>
      <p>
        Store tailoring and outerwear on proper wide, curved hangers — wire hangers deform the
        shoulder line over time. Use cedar blocks rather than mothballs to protect wool from moths
        without the lingering odor.
      </p>

      <p className="mt-6">
        Care instructions specific to each piece are also listed on its product page under
        &ldquo;Materials &amp; Care.&rdquo;
      </p>
    </LegalPageLayout>
  );
}
