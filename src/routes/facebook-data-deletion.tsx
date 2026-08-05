import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/facebook-data-deletion")({
  head: () => ({
    meta: [
      { title: "Facebook Data Deletion Instructions · Dragon Fruit South Africa" },
      { name: "description", content: "Step-by-step instructions to remove DFSA's access to your Facebook data and request deletion of any data we hold." },
      { property: "og:title", content: "Facebook Data Deletion Instructions · DFSA" },
      { property: "og:description", content: "How to delete data associated with Facebook login on the DFSA website." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FacebookDataDeletion,
});

function FacebookDataDeletion() {
  return (
    <LegalPage
      eyebrow="Data rights"
      title="Facebook Data Deletion Instructions"
      intro="If you have interacted with Dragon Fruit South Africa through Facebook, you can ask us to delete any data associated with that account."
      sections={[
        {
          heading: "1. Remove our app from Facebook",
          body: (
            <ol className="list-decimal space-y-1 pl-5">
              <li>Go to your Facebook <strong>Settings &amp; Privacy → Settings</strong>.</li>
              <li>Open <strong>Apps and Websites</strong>.</li>
              <li>Find <strong>Dragon Fruit South Africa</strong> in the list.</li>
              <li>Click <strong>Remove</strong> and confirm.</li>
            </ol>
          ),
        },
        {
          heading: "2. Request deletion of data we hold",
          body: (
            <p>
              Email <strong>admin@proagrisa.co.za</strong> with the subject line “Facebook Data Deletion Request”,
              including the name and email address linked to your Facebook account so we can locate your records.
            </p>
          ),
        },
        { heading: "3. What we delete", body: <p>We remove the profile information received from Facebook (name, email address and profile identifier) and any related activity records, unless we are legally required to retain order or tax documents.</p> },
        { heading: "4. Timeframe", body: <p>Requests are confirmed within 7 business days and completed within 30 days. We will email you once deletion is complete.</p> },
      ]}
    />
  );
}
