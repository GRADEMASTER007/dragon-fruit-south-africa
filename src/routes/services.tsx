import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CalendarClock, Video, MapPin, Sprout, Users, Scissors } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Membership · DFSA Dragon Fruit" },
      { name: "description", content: "Consultation, rooting services, farm setup and DFSA Association memberships (1, 3, 6 & 12 month options)." },
      { property: "og:title", content: "Services & Membership · DFSA" },
      { property: "og:description", content: "Expert consultation, farm setup and rooting services." },
    ],
  }),
  component: Services,
});

const services = [
  { i: CalendarClock, name: "One-on-One Consultation", price: "R 250", desc: "Personal session with our farming experts.", sku: "DFSA-1ON1-SVC-107" },
  { i: Video, name: "Video Consultation", price: "R 250", desc: "Book a live video call for advice.", sku: "DFSA-VIDEO-SVC-108" },
  { i: MapPin, name: "Farm Visit & Consultation", price: "R 850", desc: "We visit your farm — site & agronomy audit.", sku: "DFSA-VISIT-SVC-109" },
  { i: Sprout, name: "Premium Genetics Consultation", price: "R 850", desc: "Choose the perfect cultivars for your region.", sku: "DFSA-GENETICS-SVC-110" },
  { i: Sprout, name: "Farm Setup Consulting Package", price: "R 1 850", desc: "Full setup: layout, trellis, irrigation & plants.", sku: "DFSA-SETUP-SVC-111" },
  { i: Scissors, name: "Cutting Rooting Service", price: "R 30 / plant", desc: "We root your cuttings in our nursery.", sku: "DFSA-ROOT-SVC-106" },
];

const memberships = [
  { name: "1 Month", price: "R 3 000" },
  { name: "3 Months", price: "R 6 000" },
  { name: "6 Months", price: "R 12 000" },
  { name: "12 Months", price: "R 25 000" },
];

function Services() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-12 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Services</p>
        <h1 className="mt-2 font-display text-5xl font-semibold">Consulting, Rooting & Association</h1>
        <p className="mt-3 text-muted-foreground">Book expert help from our team, or join the DFSA Association for ongoing access to resources.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ i: Icon, ...s }) => (
          <div key={s.sku} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-glow">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-fruit text-white"><Icon className="h-5 w-5" /></div>
            <h3 className="font-display text-xl font-semibold">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="font-display text-2xl font-semibold text-primary">{s.price}</span>
              <Button asChild size="sm" variant="outline"><Link to="/shop">Add to cart</Link></Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="font-display text-3xl font-semibold">DFSA Association Membership</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {memberships.map((m) => (
            <div key={m.name} className="rounded-2xl border border-border bg-gradient-hero p-6 text-white shadow-glow">
              <p className="text-xs uppercase tracking-wider text-white/70">Membership</p>
              <h3 className="mt-1 font-display text-2xl font-semibold">{m.name}</h3>
              <p className="mt-4 font-display text-3xl font-semibold">{m.price}</p>
              <Button asChild className="mt-5 w-full bg-white text-primary hover:bg-white/90"><Link to="/shop">Join now</Link></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
