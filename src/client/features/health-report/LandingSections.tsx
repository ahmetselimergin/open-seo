import { Check, ListChecks, TriangleAlert } from "lucide-react";
import { Gauge } from "@/client/features/health-report/Gauge";
import { scoreTone } from "@/client/features/health-report/tones";
import { LandingClose } from "@/client/features/health-report/LandingClose";
import { homeCopy, useLang } from "@/client/features/health-report/i18n";

/** Everything shown below the hero in the idle landing state. */
export function LandingSections() {
  return (
    <div className="mt-28 flex flex-col gap-28 sm:mt-40 sm:gap-40">
      <Manifesto />
      <ScoreShowcase />
      <ProblemsShowcase />
      <PlanShowcase />
      <LandingClose />
    </div>
  );
}

function Manifesto() {
  const c = homeCopy(useLang().lang).manifesto;
  return (
    <section className="hr-reveal mx-auto max-w-3xl text-center">
      <p className="text-[clamp(1.7rem,4.4vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-balance">
        {c.lead} <span className="text-base-content/40">{c.muted}</span>
      </p>
    </section>
  );
}

function ScoreShowcase() {
  const c = homeCopy(useLang().lang).score;
  const tone = scoreTone(84);
  return (
    <section className="hr-reveal flex flex-col items-center text-center">
      <Gauge score={84} display={84} tone={tone} size="size-48" />
      <h2 className="mt-10 max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-balance">
        {c.heading}
      </h2>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-base-content/60">
        {c.body}
      </p>
    </section>
  );
}

function ProblemsShowcase() {
  const c = homeCopy(useLang().lang).problems;
  const samples = [
    { title: c.s1t, body: c.s1b, cls: "bg-error" },
    { title: c.s2t, body: c.s2b, cls: "bg-warning" },
  ];
  return (
    <section className="hr-reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col divide-y divide-base-200 rounded-[1.75rem] border border-base-300 bg-base-100 p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.25)]">
        {samples.map((p) => (
          <div key={p.title} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <span className={`mt-1 size-2.5 shrink-0 rounded-full ${p.cls}`} />
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-base-content/60">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="order-first lg:order-none">
        <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-error/10">
          <TriangleAlert className="size-5 text-error" />
        </div>
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-balance">
          {c.heading}
        </h2>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-base-content/60">
          {c.body}
        </p>
      </div>
    </section>
  );
}

function PlanShowcase() {
  const c = homeCopy(useLang().lang).plan;
  return (
    <section className="hr-reveal">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-secondary/10">
          <ListChecks className="hr-accent size-5" />
        </div>
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-balance">
          {c.heading}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-base-content/60">
          {c.body}
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {c.weeks.map((it, i) => {
          const done = i < 2;
          return (
            <div
              key={it.w}
              className="rounded-2xl border border-base-300 bg-base-100 p-5"
            >
              <p className="text-sm font-medium text-base-content/45">{it.w}</p>
              <div className="mt-3 flex items-start gap-2.5">
                <span
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md ${
                    done ? "hr-cta" : "border border-base-300"
                  }`}
                >
                  {done && <Check className="size-3.5" />}
                </span>
                <span
                  className={
                    done
                      ? "text-sm text-base-content/40 line-through"
                      : "text-sm"
                  }
                >
                  {it.task}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
