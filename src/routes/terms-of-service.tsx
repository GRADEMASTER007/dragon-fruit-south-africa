import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service · Dragon Fruit South Africa" },
      { name: "description", content: "The terms and conditions that apply when you browse, order plants from, or request a quotation through the DFSA website." },
      { property: "og:title", content: "Terms of Service · Dragon Fruit South Africa" },
      { property: "og:description", content: "Terms and conditions for ordering dragon fruit plants and services from DFSA." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms govern your use of the Dragon Fruit South Africa website and any orders, quotations or services placed through it."
      sections={[
        { heading: "1. Acceptance of terms", body: <p>By accessing this website or placing an order you agree to be bound by these terms. If you do not agree, please do not use the site.</p> },
        { heading: "2. Products and availability", body: <p>Plants are living products. Sizes, colouring and growth stage may vary from images shown. All stock is subject to availability and seasonal conditions.</p> },
        { heading: "3. Pricing and payment", body: <p>Prices are shown in the currency indicated at checkout and may change without notice. Orders are only confirmed once payment has been received in full.</p> },
        { heading: "4. Quotations", body: <p>Quotations issued through the quote request form are indicative and valid for the period stated on the quotation document.</p> },
        { heading: "5. Delivery and risk", body: <p>Delivery timelines are estimates. Risk in the goods passes to you on hand-over to the courier or on collection.</p> },
        { heading: "6. Returns and plant guarantee", body: <p>Because plants are perishable, claims must be reported with photographs within 48 hours of delivery. Damage caused by incorrect aftercare is not covered.</p> },
        { heading: "7. Intellectual property", body: <p>All content, cultivar names, branding and photography on this site belong to DFSA or its licensors and may not be reproduced without permission.</p> },
        { heading: "8. Limitation of liability", body: <p>To the maximum extent permitted by law, DFSA is not liable for indirect or consequential loss, including loss of crop, profit or business.</p> },
        { heading: "9. Governing law", body: <p>These terms are governed by the laws of the Republic of South Africa.</p> },
      ]}
    />
  );
}
