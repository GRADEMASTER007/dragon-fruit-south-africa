import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy · Dragon Fruit South Africa" },
      { name: "description", content: "Which cookies the DFSA website uses, what they do, and how you can control or disable them in your browser." },
      { property: "og:title", content: "Cookie Policy · Dragon Fruit South Africa" },
      { property: "og:description", content: "Which cookies DFSA uses and how to control them." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="Cookies are small text files stored on your device. This page explains how Dragon Fruit South Africa uses them."
      sections={[
        {
          heading: "1. Types of cookies we use",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Strictly necessary</strong> — keep your shopping cart and session working.</li>
              <li><strong>Preference</strong> — remember choices such as your cookie consent.</li>
              <li><strong>Analytics</strong> — help us understand which pages are useful (Google Analytics / Tag Manager).</li>
            </ul>
          ),
        },
        { heading: "2. Third-party cookies", body: <p>Analytics and payment providers may set their own cookies when their scripts load on our pages. Their use of data is governed by their own policies.</p> },
        { heading: "3. Managing cookies", body: <p>You can block or delete cookies in your browser settings at any time. Disabling strictly necessary cookies may break the cart and checkout.</p> },
        { heading: "4. Your consent", body: <p>By dismissing our cookie banner and continuing to use the site, you consent to the cookies described above. You can withdraw consent by clearing your browser storage.</p> },
      ]}
    />
  );
}
