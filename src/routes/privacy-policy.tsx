import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · Dragon Fruit South Africa" },
      { name: "description", content: "How Dragon Fruit South Africa collects, uses, stores and protects your personal information when you shop or request a quote." },
      { property: "og:title", content: "Privacy Policy · Dragon Fruit South Africa" },
      { property: "og:description", content: "How DFSA collects, uses and protects your personal information." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what personal information Dragon Fruit South Africa (DFSA) collects, why we collect it, and the choices you have."
      sections={[
        {
          heading: "1. Information we collect",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Contact details you provide: name, email address, phone number and delivery address.</li>
              <li>Order and quotation details: products selected, quantities and shipping preferences.</li>
              <li>Technical data: IP address, browser type, device information and pages visited.</li>
            </ul>
          ),
        },
        {
          heading: "2. How we use your information",
          body: <p>We use your information to process orders and quotations, arrange delivery, provide customer support, comply with legal obligations, and — where you have opted in — send you grower updates.</p>,
        },
        {
          heading: "3. Payment information",
          body: <p>Card and payment details are handled directly by our payment providers. DFSA does not store full card numbers on its own systems.</p>,
        },
        {
          heading: "4. Sharing with third parties",
          body: <p>We share only what is necessary with couriers and logistics partners, payment providers, and analytics providers. We do not sell your personal information.</p>,
        },
        {
          heading: "5. Data retention",
          body: <p>We keep order and quotation records for as long as required for tax, accounting and warranty purposes, after which they are deleted or anonymised.</p>,
        },
        {
          heading: "6. Your rights",
          body: <p>You may request access to, correction of, or deletion of your personal information at any time by contacting us. You may also object to direct marketing.</p>,
        },
        {
          heading: "7. Security",
          body: <p>We apply reasonable technical and organisational measures to protect your data, but no method of transmission over the internet is completely secure.</p>,
        },
        {
          heading: "8. Changes to this policy",
          body: <p>We may update this policy from time to time. The revision date at the top of this page reflects the latest version.</p>,
        },
      ]}
    />
  );
}
