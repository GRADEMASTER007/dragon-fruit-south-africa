import type { ReactNode } from "react";

export type LegalSection = { heading: string; body: ReactNode };

export function LegalPage({
  eyebrow = "Legal",
  title,
  intro,
  updated = "5 August 2026",
  sections,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  updated?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{intro}</p>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Last updated: {updated}</p>

      <div className="mt-10 space-y-9">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl font-semibold">{s.heading}</h2>
            <div className="mt-3 space-y-3 text-base leading-relaxed text-foreground/85">{s.body}</div>
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-xl border border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Questions about this policy?</p>
        <p className="mt-1">
          Contact Dragon Fruit South Africa at admin@proagrisa.co.za or +27 83 447 4639.
        </p>
        <p className="mt-3 text-xs">
          This page contains placeholder content and is not legal advice. Please have it reviewed by a qualified
          legal practitioner before relying on it.
        </p>
      </div>
    </div>
  );
}
