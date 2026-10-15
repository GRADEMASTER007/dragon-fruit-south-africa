import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy · Dragon Fruit South Africa" },
      {
        name: "description",
        content:
          "How DFSA uses necessary cookies for secure sign-in and native database-backed shopping carts, and how you can control them.",
      },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="This page describes the necessary cookies used by the Manus-hosted DFSA application."
      sections={[
        {
          heading: "Necessary cookies",
          body: (
            <p>
              The dfsa_guest cookie is a random identifier used to find your native-database cart
              and notice preference; it expires after 90 days. It contains no cart contents, payment
              keys or contact details. The webdev_app_session cookie supports verified Manus login
              and lasts up to 30 days. A short-lived dfsa_oauth_state cookie binds sign-in to the
              browser that started it.
            </p>
          ),
        },
        {
          heading: "Where data is stored",
          body: (
            <p>
              Application business records, cart contents and notice preferences are stored in the
              Manus-native database. Browser identifiers and signed login tokens are used to access
              those records; browser local storage is not an alternative authoritative database.
            </p>
          ),
        },
        {
          heading: "Analytics and payment providers",
          body: (
            <p>
              This application does not load Google Analytics or Google Tag Manager. Manus platform
              delivery may set operational cookies under its own policies. If you continue to a
              separately hosted payment provider, that provider's necessary payment cookies and
              privacy policy apply on its service. The app does not collect card numbers or CVVs.
            </p>
          ),
        },
        {
          heading: "Your controls",
          body: (
            <p>
              You may block or delete cookies through browser settings. Blocking necessary cookies
              can stop cart persistence, login or access to your guest order. Acknowledging our
              necessary-cookie notice saves only that notice preference; it does not grant consent
              to marketing or analytics tracking.
            </p>
          ),
        },
      ]}
    />
  );
}
