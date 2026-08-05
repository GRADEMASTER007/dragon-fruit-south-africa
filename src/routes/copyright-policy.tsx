import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/copyright-policy")({
  head: () => ({
    meta: [
      { title: "Copyright Policy · Dragon Fruit South Africa" },
      { name: "description", content: "How DFSA protects its content and cultivar branding, and how to submit a copyright infringement notice or counter-notice." },
      { property: "og:title", content: "Copyright Policy · Dragon Fruit South Africa" },
      { property: "og:description", content: "Copyright ownership and infringement notice procedure for the DFSA website." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CopyrightPolicy,
});

function CopyrightPolicy() {
  return (
    <LegalPage
      title="Copyright Policy"
      intro="Dragon Fruit South Africa respects intellectual property rights and expects visitors to do the same."
      sections={[
        { heading: "1. Ownership of site content", body: <p>All text, photography, cultivar branding, manuals, business plans and course material on this site are owned by DFSA or licensed to us, and are protected by copyright.</p> },
        { heading: "2. Permitted use", body: <p>You may view and print pages for personal, non-commercial reference. Any republication, resale or bulk copying requires our written permission.</p> },
        { heading: "3. Reporting infringement", body: (
          <ul className="list-disc space-y-1 pl-5">
            <li>Identify the copyrighted work you believe has been infringed.</li>
            <li>Provide the exact URL of the material in question.</li>
            <li>Give your contact details and a statement that you are the rights holder or authorised agent.</li>
            <li>Email the notice to admin@proagrisa.co.za.</li>
          </ul>
        ) },
        { heading: "4. Our response", body: <p>We will review valid notices promptly and remove or disable access to infringing material where appropriate.</p> },
        { heading: "5. Counter-notice", body: <p>If your material was removed in error, send a counter-notice with your reasons and contact details and we will reconsider.</p> },
        { heading: "6. Repeat infringers", body: <p>Accounts or partners who repeatedly infringe copyright may lose access to our services.</p> },
      ]}
    />
  );
}
