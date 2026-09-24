import { ArrowUp, ShieldCheck } from "lucide-react";
import { homeCopy, useLang } from "@/client/features/health-report/i18n";

/** Cinematic dark CTA band + FAQ + footer (the close of the landing page). */
export function LandingClose() {
  return (
    <>
      <DarkCta />
      <Faq />
      <SiteFooter />
    </>
  );
}

function DarkCta() {
  const c = homeCopy(useLang().lang).cta;
  return (
    <section className="hr-surface hr-reveal relative overflow-hidden rounded-[2rem] px-6 py-20 text-center sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 80% at 50% 0%, color-mix(in oklab, var(--hr-accent) 22%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <h2 className="mx-auto max-w-2xl text-[clamp(2rem,5.5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-balance">
          {c.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-base-content/60">
          {c.body}
        </p>
        <a
          href="#hr-start"
          className="hr-cta mt-8 inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-lg font-semibold"
        >
          {c.button}
          <ArrowUp className="size-5" />
        </a>
      </div>
    </section>
  );
}

function Faq() {
  const c = homeCopy(useLang().lang);
  return (
    <section className="hr-reveal mx-auto w-full max-w-3xl">
      <h2 className="text-center text-[clamp(1.8rem,4.5vw,3rem)] font-semibold tracking-[-0.02em]">
        {c.faqHeading}
      </h2>
      <div className="mt-10 flex flex-col divide-y divide-base-300 border-y border-base-300">
        {c.faq.map(({ q, a }) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
              {q}
              <span className="hr-accent shrink-0 text-2xl leading-none transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl leading-relaxed text-base-content/65">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function SiteFooter() {
  const c = homeCopy(useLang().lang).footer;
  const links: { href: string; label: string }[] = [
    { href: "/araclar", label: c.tools },
    { href: "/fiyatlandirma", label: c.pricing },
    { href: "/karsilastir", label: c.compare },
    { href: "/rehber", label: c.guide },
    { href: "/gizlilik", label: c.privacy },
    { href: "/kullanim-kosullari", label: c.terms },
  ];
  return (
    <footer className="flex flex-col gap-4 border-t border-base-300 pt-10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xl font-bold tracking-tight">
          my<span className="hr-accent">Seo</span>
        </p>
        <p className="mt-1 text-sm text-base-content/50">{c.tagline}</p>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <p className="inline-flex items-center gap-1.5 text-sm text-base-content/45">
          <ShieldCheck className="size-4" />
          {c.free}
        </p>
        <nav className="flex flex-wrap gap-4 text-sm text-base-content/55">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-base-content"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
