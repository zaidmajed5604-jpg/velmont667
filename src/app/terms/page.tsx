import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/legal-page-layout";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Terms of Service" updatedAt="July 28, 2026">
      <p>
        These terms govern your use of the VELMONT website and your purchase of products from us.
        By placing an order, you agree to these terms.
      </p>

      <h2>Orders & Pricing</h2>
      <p>
        All prices are listed in the currency shown at checkout and are subject to change without
        notice. We reserve the right to refuse or cancel any order, including for pricing errors,
        suspected fraud, or insufficient stock.
      </p>

      <h2>Payment</h2>
      <p>
        Payment is processed securely at the time of order. We accept major credit cards and the
        payment methods shown at checkout.
      </p>

      <h2>Shipping & Risk of Loss</h2>
      <p>
        Risk of loss and title for items purchased pass to you upon delivery to the shipping
        carrier. See our Shipping policy for delivery timelines.
      </p>

      <h2>Returns</h2>
      <p>
        Returns are accepted within 30 days of delivery in original condition. See our Returns
        policy for full details and exceptions.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on this site — including text, graphics, logos, and images — is the property
        of VELMONT and protected by intellectual property law. You may not reproduce or use it
        without written permission.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        VELMONT is not liable for indirect, incidental, or consequential damages arising from your
        use of the site or products, to the fullest extent permitted by law.
      </p>

      <h2>Governing Law</h2>
      <p>These terms are governed by the laws of the State of New York.</p>

      <h2>Contact</h2>
      <p>Questions about these terms can be directed to legal@velmont.com.</p>
    </LegalPageLayout>
  );
}
