import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/legal-page-layout";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <LegalPageLayout eyebrow="Support" title="Returns & Exchanges">
      <h2>Our Policy</h2>
      <p>
        We want you to be entirely satisfied with your VELMONT pieces. Items may be returned
        within 30 days of delivery for a full refund, provided they are unworn, unwashed, and in
        their original packaging with tags attached.
      </p>

      <h2>How to Start a Return</h2>
      <p>
        Sign in to your Account &rarr; Orders page and select &ldquo;Start a Return&rdquo; on the
        relevant order, or contact our concierge team at concierge@velmont.com with your order
        number.
      </p>

      <h2>Refunds</h2>
      <p>
        Once your return is received and inspected, we&rsquo;ll process your refund to the original
        payment method within 5–7 business days. You&rsquo;ll receive an email confirmation once
        it&rsquo;s issued.
      </p>

      <h2>Exchanges</h2>
      <p>
        For a different size or color, we recommend placing a new order and returning the original
        for a refund — this is the fastest way to secure the item you want, particularly for
        limited pieces.
      </p>

      <h2>Non-Returnable Items</h2>
      <p>
        For hygiene reasons, undergarments and swimwear are final sale. Made-to-order or monogrammed
        pieces are also non-returnable unless defective.
      </p>

      <h2>Return Shipping</h2>
      <p>
        Domestic returns include a prepaid shipping label. International return shipping costs are
        the customer&rsquo;s responsibility unless the item arrived damaged or incorrect.
      </p>
    </LegalPageLayout>
  );
}
