import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Globe,
  Link2,
  TrendingUp,
} from "lucide-react";
import { Gauge } from "@/client/features/health-report/Gauge";
import { scoreTone } from "@/client/features/health-report/tones";
import { ScorecardSkeleton } from "@/client/features/health-report/visuals";
import { homeCopy, useLang } from "@/client/features/health-report/i18n";

interface FormProps {
  domain: string;
  email: string;
  onDomain: (v: string) => void;
  onEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

export function Hero(props: FormProps & { isLoading: boolean }) {
  const c = homeCopy(useLang().lang).hero;
  return (
    <section
      id="hr-start"
      className="hr-aura grid scroll-mt-24 items-center gap-16 pt-8 lg:min-h-[68vh] lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:pt-16"
    >
      <div className="hr-in flex flex-col items-center text-center lg:items-start lg:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/60 px-3.5 py-1.5 text-sm font-medium text-base-content/70">
          <span className="size-1.5 rounded-full bg-[var(--hr-accent)]" />
          {c.badge}
        </span>

        <h1 className="mt-6 text-[clamp(2.4rem,4.8vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-balance">
          {c.title1}
          <br />
          <span className="hr-accent">{c.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-base-content/60">
          {c.subtitle}
        </p>

        <SearchForm {...props} />
      </div>

      <div className="w-full">
        {props.isLoading ? <ScanningPanel /> : <HeroShowcase />}
      </div>
    </section>
  );
}

function SearchForm(props: FormProps) {
  const c = homeCopy(useLang().lang).hero;
  return (
    <form
      onSubmit={props.onSubmit}
      className="mt-8 flex w-full max-w-md flex-col gap-3"
    >
      <div className="hr-field flex items-center gap-2 rounded-2xl border border-base-300 p-1.5 pl-4 transition-[border-color,box-shadow]">
        <Globe className="size-5 shrink-0 text-base-content/40" />
        <input
          type="text"
          inputMode="url"
          autoComplete="url"
          aria-label={c.domainPlaceholder}
          placeholder={c.domainPlaceholder}
          className="w-full bg-transparent py-3 text-base outline-none placeholder:text-base-content/35"
          value={props.domain}
          onChange={(e) => props.onDomain(e.target.value)}
          required
        />
        <button
          type="submit"
          className="hr-cta inline-flex shrink-0 items-center gap-1.5 rounded-xl px-5 py-3 font-semibold disabled:opacity-50"
          disabled={!props.domain.trim()}
        >
          {c.scan}
          <ArrowRight className="size-4" />
        </button>
      </div>

      <input
        type="email"
        autoComplete="email"
        aria-label={c.emailPlaceholder}
        placeholder={c.emailPlaceholder}
        className="hr-field w-full rounded-2xl border border-base-300 px-4 py-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35"
        value={props.email}
        onChange={(e) => props.onEmail(e.target.value)}
      />

      {props.error && (
        <div className="flex items-center gap-2 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          <AlertTriangle className="size-4 shrink-0" />
          {props.error}
        </div>
      )}

      <p className="text-sm text-base-content/45">{c.trust}</p>
    </form>
  );
}

function HeroShowcase() {
  const c = homeCopy(useLang().lang).visual;
  return (
    <div className="hr-spotlight mx-auto w-full max-w-md lg:mr-0 lg:ml-auto">
      <div className="hr-reveal hr-tilt relative">
        <div className="hr-float">
          <HeroVisual />
        </div>

        <div className="hr-chip hr-chip-a absolute -top-6 left-6 z-10 hidden items-center gap-2 rounded-2xl px-3.5 py-2 sm:flex">
          <TrendingUp className="hr-accent size-4" />
          <span className="text-sm font-semibold">{c.chipPoints}</span>
          <span className="text-xs text-base-content/45">
            {c.chipPointsNote}
          </span>
        </div>

        <div className="hr-chip hr-chip-b absolute -bottom-6 right-6 z-10 hidden items-center gap-2 rounded-2xl px-3.5 py-2 sm:flex">
          <span className="size-2 rounded-full bg-warning" />
          <span className="text-sm font-semibold">{c.chipIssues}</span>
          <span className="text-xs text-base-content/45">
            {c.chipIssuesNote}
          </span>
        </div>
      </div>
    </div>
  );
}

function HeroVisual() {
  const c = homeCopy(useLang().lang).visual;
  const tone = scoreTone(86);
  const issues = [
    {
      icon: AlertTriangle,
      label: c.missingTitle,
      pages: c.pages3,
      cls: "text-error",
    },
    { icon: Link2, label: c.brokenLink, pages: c.pages2, cls: "text-warning" },
  ];
  return (
    <div className="hr-surface overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-base-300 px-4 py-3">
        <span className="hr-dot" />
        <span className="hr-dot" />
        <span className="hr-dot" />
        <div className="ml-2 flex flex-1 items-center gap-1.5 truncate rounded-md bg-base-200/60 px-3 py-1 text-xs text-base-content/45">
          <Globe className="size-3" />
          {c.urlBar}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-5">
          <Gauge score={86} display={86} tone={tone} size="size-24" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/50">
                {c.scoreLabel}
              </span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                {c.grade}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {c.healthy}
            </p>
            <p className="text-sm text-base-content/45">{c.pagesScanned}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2.5 border-t border-base-300 pt-5">
          {issues.map(({ icon: Icon, label, pages, cls }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl bg-base-200/50 px-3 py-2.5 text-sm"
            >
              <Icon className={`size-4 shrink-0 ${cls}`} />
              <span className="font-medium">{label}</span>
              <span className="ml-auto text-base-content/45">{pages}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScanningPanel() {
  const status = homeCopy(useLang().lang).scanning;
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % status.length), 1600);
    return () => clearInterval(id);
  }, [status.length]);
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <ScorecardSkeleton />
      <p
        key={step}
        className="hr-fade text-center text-sm text-base-content/55"
      >
        {status[step]}
      </p>
    </div>
  );
}
