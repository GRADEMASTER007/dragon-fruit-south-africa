import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sprout, Globe2, Award, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/dragon-fruit-hero.jpg";
import farmImg from "@/assets/dragon-fruit-farm.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DFSA · Premium Dragon Fruit Plants South Africa · Since 2008" },
      { name: "description", content: "Wonderful Dragon Fruit · Worldwide Commercial Plant Supply. Leading dragon fruit farming since 2008 across South Africa, Botswana, Zambia, Zimbabwe and beyond." },
      { property: "og:title", content: "DFSA · Dragon Fruit South Africa" },
      { property: "og:description", content: "Premium dragon fruit plants, cultivars and consultation. Worldwide export from South Africa." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 -z-10 opacity-30 mix-blend-overlay">
          <img src={heroImg} alt="" className="h-full w-full object-cover" width={1600} height={1000} />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 md:pb-32">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
              <Award className="h-3.5 w-3.5" /> Since 2008 · Premium Plants
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] text-balance sm:text-6xl md:text-7xl">
              Wonderful Dragon Fruit
              <span className="mt-2 block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Worldwide Commercial Plant Supply
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              Leading the dragon fruit farming industry since 2008. We provide high-yield plants,
              expert consultation, and worldwide export services — from South Africa to Botswana,
              Zambia, Zimbabwe, Uganda, Namibia, Malawi and beyond.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/shop">Shop Cultivars <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <Link to="/services">Book Consultation</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/80">
              <span>🇿🇦 South Africa</span>
              <span>🇧🇼 Botswana</span>
              <span>🇿🇼 Zimbabwe</span>
              <span>🇳🇦 Namibia</span>
              <span>🇿🇲 Zambia</span>
              <span>🌍 Worldwide Export</span>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-6 rounded-3xl bg-white/10 blur-2xl" />
            <img
              src={heroImg}
              alt="Ripe dragon fruit sliced open"
              width={1600}
              height={1000}
              className="relative aspect-[4/5] w-full rounded-3xl object-cover shadow-glow"
            />
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { i: Sprout, t: "Certified Genetics", d: "Ruby, Sweet White Crystal, Black Dragon Africana Hybrid and 90+ premium cultivars." },
            { i: Globe2, t: "Worldwide Export", d: "Trusted supplier across Southern Africa and international commercial farms." },
            { i: Truck, t: "PUDO Shipping", d: "Convenient locker & door delivery via PUDO for cuttings and small orders." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-fruit text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CULTIVARS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Signature Cultivars</p>
              <h2 className="mt-2 font-display text-4xl font-semibold">Flagship Plant Varieties</h2>
            </div>
            <Button asChild variant="outline"><Link to="/shop">View all →</Link></Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "SWEET-WHITE-CRYSTAL™", tag: "Signature White", desc: "Sweet, aromatic white flesh. High-yield commercial cultivar." },
              { name: "RUBY™", tag: "Deep Red", desc: "Vibrant ruby flesh with excellent shelf life and rich flavour." },
              { name: "Black Dragon Africana Hybrid", tag: "Rare Premium", desc: "Africa-adapted rare variety with exceptional Brix." },
            ].map((v) => (
              <div key={v.name} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow">
                <div className="aspect-[4/3] bg-gradient-fruit" />
                <div className="p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">{v.tag}</span>
                  <h3 className="mt-1 font-display text-xl font-semibold">{v.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FARM SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <img
            src={farmImg}
            alt="Dragon fruit farm rows"
            width={1400}
            height={900}
            loading="lazy"
            className="aspect-[5/4] w-full rounded-3xl object-cover shadow-card"
          />
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Healthy Fields</p>
            <h2 className="mt-2 font-display text-4xl font-semibold">Africa's Trusted Dragon Fruit Nursery</h2>
            <p className="mt-4 text-muted-foreground">
              From 150-plant starter trays to 1000-plant commercial packs, DFSA delivers vigorous, disease-free stock
              backed by 17+ years of agronomic experience.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "High-yield trellised cultivars",
                "Full commercial trays: 150 · 250 · 500 · 1000 plants",
                "Agricultural funding manual & business plans",
                "Farm setup consulting & rooting services",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Button asChild className="bg-gradient-fruit text-white shadow-glow hover:opacity-95"><Link to="/shop">Browse Plants</Link></Button>
              <Button asChild variant="outline"><Link to="/contact">Talk to Us</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-gradient-hero p-10 text-center text-white shadow-glow md:p-16">
          <h2 className="font-display text-4xl font-semibold md:text-5xl">Start your dragon fruit farm</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">
            Join hundreds of commercial growers across Africa. Order plants, book a consultation, or become a DFSA member today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90"><Link to="/shop">Shop Now</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20"><Link to="/services">Join Association</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
