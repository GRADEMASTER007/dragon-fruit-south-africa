import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sprout, Globe2, Award, Truck, CheckCircle2, MapPin, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/african-dragon-fruit-farm-hero.jpg";
import sweetWhiteAsset from "@/assets/sweet-white-crystal.jpg.asset.json";
import rubyAsset from "@/assets/ruby.jpg.asset.json";
import blackDragonAsset from "@/assets/black-dragon-africana.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DFSA · Premium Dragon Fruit Plants South Africa · Since 2008" },
      { name: "description", content: "Wonderful Dragon Fruit · Worldwide Commercial Plant Supply. Leading dragon fruit farming since 2008 across South Africa, Botswana, Zambia, Zimbabwe and beyond." },
      { property: "og:title", content: "DFSA · Dragon Fruit South Africa" },
      { property: "og:description", content: "Premium dragon fruit plants, cultivars and consultation. Worldwide export from South Africa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="bg-home-canvas">
      <section className="relative flex min-h-[78svh] items-end overflow-hidden md:min-h-[calc(100svh-65px)] md:items-center">
        <img src={heroImg} alt="Dragon fruit farming field in South Africa at sunrise" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-hero-shade" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 md:py-24">
          <div className="max-w-3xl text-home-light">
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary sm:text-sm">
              <span className="h-px w-10 bg-primary" /> Cultivated in the African sun
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.04] sm:text-6xl md:text-8xl">
              Premium dragon fruit plants,
              <span className="mt-2 block italic text-home-leaf">rooted in African soil.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-home-light/80 sm:text-xl">
              Commercial plant supply, trusted genetics and expert grower support from South Africa to farms across the world — since 2008.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-12 rounded-sm px-7 shadow-glow">
                <Link to="/shop">Explore our plants <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12 rounded-sm border-home-light/45 bg-home-dark/20 px-7 text-home-light hover:bg-home-light hover:text-home-dark">
                <Link to="/quote"><Quote className="mr-2 h-4 w-4" /> Request a quote</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 right-5 hidden items-center gap-2 text-xs uppercase tracking-[0.15em] text-home-light/70 md:flex">
          <MapPin className="h-4 w-4 text-primary" /> South Africa
        </div>
      </section>

      <section className="border-b border-home-dark/10 bg-home-light py-5">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-5 px-4 sm:px-6 md:grid-cols-4">
          {[
            ["17+ years", "Growing expertise"],
            ["90+", "Premium cultivars"],
            ["Southern Africa", "Regional supply"],
            ["Worldwide", "Commercial export"],
          ].map(([value, label]) => (
            <div key={label} className="border-home-dark/10 px-3 text-center md:border-r md:last:border-r-0">
              <p className="font-display text-xl font-semibold text-home-dark sm:text-2xl">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-home-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Our signature genetics</p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-home-dark md:text-6xl">Exceptional African cultivars</h2>
              <p className="mt-4 max-w-xl text-home-muted">Proven plants selected for flavour, yield and commercial performance in African growing conditions.</p>
            </div>
            <Button asChild variant="link" className="w-fit px-0 text-primary"><Link to="/shop">View the full collection <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-7">
            {[
              { name: "SWEET-WHITE-CRYSTAL™", tag: "Signature White", desc: "Sweet, aromatic white flesh. High-yield commercial cultivar.", img: sweetWhiteAsset.url },
              { name: "RUBY™", tag: "Deep Red", desc: "Vibrant ruby flesh with excellent shelf life and rich flavour.", img: rubyAsset.url },
              { name: "Black Dragon Africana Hybrid", tag: "Rare Premium", desc: "Africa-adapted rare variety with exceptional Brix.", img: blackDragonAsset.url },
            ].map((v) => (
              <article key={v.name} className="group">
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <img src={v.img} alt={v.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="pt-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{v.tag}</span>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-home-dark">{v.name}</h3>
                  <p className="mt-3 leading-relaxed text-home-muted">{v.desc}</p>
                  <Link to="/shop" className="mt-5 inline-flex items-center text-sm font-semibold text-home-dark transition hover:text-primary">Shop this cultivar <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-home-dark py-20 text-home-light md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
          <div className="relative overflow-hidden">
            <img src={heroImg} alt="Commercial dragon fruit rows in an African farming landscape" width={1920} height={1080} loading="lazy" className="aspect-[5/4] w-full object-cover object-right" />
            <div className="absolute bottom-0 right-0 bg-primary p-5 sm:p-7">
              <p className="font-display text-3xl font-semibold">Since 2008</p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em]">African growing expertise</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Rooted in experience</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">Built for commercial growers. Proven in African fields.</h2>
            <p className="mt-6 text-lg leading-relaxed text-home-light/70">From 150-plant starter trays to 1,000-plant commercial packs, we deliver vigorous stock backed by practical agronomic support.</p>
            <ul className="mt-8 space-y-4">
              {[
                "High-yield trellised cultivars",
                "Full commercial trays: 150 · 250 · 500 · 1000 plants",
                "Agricultural funding manual & business plans",
                "Farm setup consulting & rooting services",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-home-leaf" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild className="rounded-sm"><Link to="/services">Explore grower services</Link></Button>
              <Button asChild variant="outline" className="rounded-sm border-home-light/35 bg-transparent text-home-light hover:bg-home-light hover:text-home-dark"><Link to="/contact">Talk to our team</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-home-light py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3">
          {[
            { i: Sprout, t: "Trusted genetics", d: "Ruby, Sweet White Crystal, Black Dragon Africana Hybrid and 90+ cultivars." },
            { i: Globe2, t: "Commercial export", d: "Supplying farms across Southern Africa and international growing regions." },
            { i: Truck, t: "Flexible delivery", d: "PUDO locker and door delivery available for cuttings and smaller orders." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="flex gap-5 border-t border-home-dark/15 pt-6">
              <Icon className="h-7 w-7 shrink-0 text-primary" />
              <div><h3 className="font-display text-xl font-semibold text-home-dark">{t}</h3><p className="mt-2 text-sm leading-relaxed text-home-muted">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary px-4 py-16 text-center text-primary-foreground sm:px-6 md:py-20">
        <Award className="mx-auto h-8 w-8" />
        <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">Ready to grow your dragon fruit farm?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-primary-foreground/80">Select your plants and send us your delivery details. We’ll prepare a tailored quotation for your project.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="rounded-sm"><Link to="/quote">Request a quotation <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button asChild size="lg" variant="outline" className="rounded-sm border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"><Link to="/shop">Browse all plants</Link></Button>
        </div>
      </section>
    </div>
  );
}
