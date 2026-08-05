import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";

const legalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-of-service", label: "Terms of Service" },
  { to: "/cookie-policy", label: "Cookie Policy" },
  { to: "/community-guidelines", label: "Community Guidelines" },
  { to: "/copyright-policy", label: "Copyright Policy" },
  { to: "/facebook-data-deletion", label: "Facebook Data Deletion" },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-fruit text-lg text-white">🐉</div>
            <div>
              <div className="font-display text-lg font-semibold">DFSA</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Dragon Fruit South Africa</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Leading the dragon fruit farming industry since 2008. Premium plants, expert consultation, and worldwide export.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> admin@proagrisa.co.za</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +27 83 447 4639</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 351 777 2848</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary">Shop Cultivars</Link></li>
            <li><Link to="/quote" className="hover:text-primary">Request Quote</Link></li>
            <li><Link to="/services" className="hover:text-primary">Book Consultation</Link></li>
            <li><Link to="/services" className="hover:text-primary">Rooting Services</Link></li>
            <li><Link to="/about" className="hover:text-primary">About DFSA</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Countries We Serve</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>🇿🇦 South Africa</li>
            <li>🇧🇼 Botswana</li>
            <li>🇿🇼 Zimbabwe</li>
            <li>🇳🇦 Namibia</li>
            <li>🇿🇲 Zambia · 🇺🇬 Uganda · 🇲🇼 Malawi</li>
            <li className="pt-1 font-medium text-foreground">Worldwide Export</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {legalLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-primary" activeProps={{ className: "text-primary" }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Dragon Fruit South Africa · Since 2008 · Worldwide Commercial Plant Supply
      </div>
    </footer>
  );
}
