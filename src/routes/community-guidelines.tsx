import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    meta: [
      { title: "Community Guidelines · Dragon Fruit South Africa" },
      { name: "description", content: "How growers, members and customers are expected to behave in DFSA community spaces, reviews and association channels." },
      { property: "og:title", content: "Community Guidelines · Dragon Fruit South Africa" },
      { property: "og:description", content: "Standards of conduct for the DFSA grower community." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityGuidelines,
});

function CommunityGuidelines() {
  return (
    <LegalPage
      eyebrow="Community"
      title="Community Guidelines"
      intro="Our association groups, comment threads and grower channels exist to help farmers succeed. These guidelines keep them useful for everyone."
      sections={[
        { heading: "1. Be respectful", body: <p>Treat other growers with courtesy. Harassment, hate speech, threats or personal attacks are not tolerated.</p> },
        { heading: "2. Share accurate information", body: <p>Agronomic advice should be based on real experience. Do not present unverified claims as fact, especially regarding chemicals or plant health.</p> },
        { heading: "3. No spam or unsolicited selling", body: <p>Do not post repetitive promotions, pyramid schemes or unrelated commercial offers in community spaces.</p> },
        { heading: "4. Respect privacy", body: <p>Do not share other people's contact details, farm locations, photographs or private messages without permission.</p> },
        { heading: "5. Keep it lawful", body: <p>Do not use our channels to arrange the sale of restricted plant material, unregistered agrochemicals or anything else prohibited by law.</p> },
        { heading: "6. Enforcement", body: <p>We may edit or remove content and suspend access where these guidelines are breached. Serious breaches may end association membership.</p> },
        { heading: "7. Reporting", body: <p>Report content that concerns you to admin@proagrisa.co.za with a link or screenshot.</p> },
      ]}
    />
  );
}
