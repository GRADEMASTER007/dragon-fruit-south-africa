import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact DFSA · Dragon Fruit South Africa" },
      { name: "description", content: "Get in touch with DFSA. Email admin@proagrisa.co.za or call +27 83 447 4639." },
      { property: "og:title", content: "Contact DFSA" },
      { property: "og:description", content: "Reach the DFSA team for orders, consultation and export enquiries." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent — we'll be in touch soon.");
    setForm({ name: "", email: "", message: "" });
  };
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Contact</p>
      <h1 className="mt-2 font-display text-5xl font-semibold">Talk to our team</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Orders, exports, consultation — we're happy to help.</p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><a href="mailto:admin@proagrisa.co.za" className="font-medium">admin@proagrisa.co.za</a></div>
            <div className="mt-3 flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><a href="tel:+27834474639" className="font-medium">+27 83 447 4639</a></div>
            <div className="mt-3 flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><a href="tel:+13517772848" className="font-medium">+1 351 777 2848</a></div>
            <div className="mt-3 flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span className="font-medium">South Africa · Worldwide export</span></div>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-hero p-6 text-white shadow-glow">
            <h3 className="font-display text-xl font-semibold">Countries We Serve</h3>
            <p className="mt-2 text-sm text-white/80">🇿🇦 South Africa · 🇧🇼 Botswana · 🇿🇼 Zimbabwe · 🇳🇦 Namibia · 🇿🇲 Zambia · 🇺🇬 Uganda · 🇲🇼 Malawi · 🌍 Worldwide</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Message</Label><Textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <Button className="w-full bg-gradient-fruit text-white shadow-glow hover:opacity-95">Send Message</Button>
        </form>
      </div>
    </div>
  );
}
