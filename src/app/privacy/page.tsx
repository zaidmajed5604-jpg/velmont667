import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/legal-page-layout";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Privacy Policy" updatedAt="July 28, 2026">
      <p>
        VELMONT (&ldquo;we,&rdquo; &ldquo;us&rdquo;) respects your privacy. This policy explains what
        information we collect, how we use it, and the choices you have.
      </p>

      <h2>Information We Collect</h2>
      <p>We collect information you provide directly, including:</p>
      <ul>
        <li>Account details — name, email, and password when you register</li>
        <li>Order information — shipping and billing addresses, phone number</li>
        <li>Payment details — processed and stored by our payment provider, never on our servers</li>
        <li>Communications — messages sent through our contact form or to our support team</li>
      </ul>
      <p>
        We also collect limited technical information automatically, such as device type, browser,
        and pages visited, to keep the site secure and improve performance.
      </p>

      <h2>How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process and fulfill orders, including shipping and customer service</li>
        <li>Maintain your account and order history</li>
        <li>Send order confirmations, shipping updates, and — with your consent — marketing communications</li>
        <li>Detect and prevent fraud and abuse</li>
        <li>Improve our products and site experience</li>
      </ul>

      <h2>Sharing Your Information</h2>
      <p>
        We share information only with service providers who help us operate — payment processing,
        shipping carriers, and email delivery — under contracts that limit their use of your data.
        We never sell your personal information.
      </p>

      <h2>Your Rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, delete, or export
        your personal information. Contact us at privacy@velmont.com to exercise these rights.
      </p>

      <h2>Cookies</h2>
      <p>
        We use essential cookies to operate the site (cart, sign-in) and, with your consent,
        analytics cookies to understand how the site is used.
      </p>

      <h2>Contact</h2>
      <p>Questions about this policy can be directed to privacy@velmont.com.</p>
    </LegalPageLayout>
  );
}
