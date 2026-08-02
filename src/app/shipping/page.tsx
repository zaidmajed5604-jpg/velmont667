import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/legal-page-layout";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <LegalPageLayout eyebrow="Support" title="Shipping">
      <h2>Domestic Shipping (US)</h2>
      <p>
        Orders over $200 ship free. Orders under $200 incur a flat $15 shipping fee. Standard
        delivery arrives in 3–5 business days; express delivery (1–2 business days) is available at
        checkout for an additional fee.
      </p>

      <h2>International Shipping</h2>
      <p>
        We ship to most countries. International delivery typically takes 7–14 business days.
        Import duties and taxes are the responsibility of the recipient and are not included in
        the item price or shipping cost.
      </p>

      <h2>Processing Time</h2>
      <p>
        Orders are processed within 1–2 business days. You&rsquo;ll receive a shipping confirmation
        with tracking information as soon as your order leaves our facility.
      </p>

      <h2>Order Tracking</h2>
      <p>
        Track your order any time from your Account &rarr; Orders page, or via the tracking link in
        your shipping confirmation email.
      </p>

      <h2>Delays</h2>
      <p>
        While we aim to meet the timelines above, occasional delays can occur due to customs
        processing or carrier disruptions. Contact us if your order hasn&rsquo;t arrived within the
        expected window.
      </p>
    </LegalPageLayout>
  );
}
