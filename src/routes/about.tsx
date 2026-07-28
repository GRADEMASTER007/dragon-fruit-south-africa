import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About DFSA · Since 2008 · Dragon Fruit South Africa" },
      { name: "description", content: "Dragon Fruit South Africa has led African dragon fruit farming since 2008. Learn about our mission, farm and worldwide supply." },
      { property: "og:title", content: "About DFSA — Since 2008" },
      { property: "og:description", content: "Africa's leading dragon fruit nursery, exporter and consultancy." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">About</p>
      <h1 className="mt-2 font-display text-5xl font-semibold">Dragon Fruit South Africa</h1>
      <p className="mt-2 text-lg text-muted-foreground">Wonderful Dragon Fruit · Worldwide Commercial Plant Supply · Since 2008.</p>

      <div className="prose prose-lg mt-10 max-w-none text-foreground/90">
        <p>
          DFSA (Dragon Fruit South Africa) has led the African dragon fruit farming industry since 2008.
          What began as a small research farm has grown into a nursery and consultancy that supplies commercial
          growers across South Africa, Botswana, Zambia, Zimbabwe, Uganda, Namibia, Malawi — and worldwide.
        </p>
        <p>
          Our operation focuses on <strong>high-yield, disease-free genetics</strong>: from our flagship
          Sweet-White-Crystal™ and Ruby™ cultivars, to the rare Black Dragon Africana Hybrid and 90+ premium
          varieties. Every plant we ship is grown, hardened and inspected in-house.
        </p>
        <p>
          Beyond plants, we offer <strong>farm setup consulting</strong>, agronomy support, cutting rooting
          services, agricultural funding manuals and business plans for 1–5 hectare operations. The DFSA
          Association gives members ongoing access to expertise, market intelligence and grower resources.
        </p>
        <p>
          We ship domestically via <strong>PUDO</strong> and internationally through certified freight partners.
          Whether you are planting your first 150 cuttings or scaling to a 1 000-plant commercial tray, our team
          is here to help you succeed.
        </p>
      </div>
    </div>
  );
}
