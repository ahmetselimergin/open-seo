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

interface FormProps {
  domain: string;
  email: string;
  onDomain: (v: string) => void;
  onEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

export function Hero(props: FormProps & { isLoading: boolean }) {
  return (
    <section
      id="hr-start"
      className="hr-aura grid scroll-mt-24 items-center gap-16 pt-8 lg:min-h-[68vh] lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:pt-16"
    >
      <div className="hr-in flex flex-col items-center text-center lg:items-start lg:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/60 px-3.5 py-1.5 text-sm font-medium text-base-content/70">
          <span className="size-1.5 rounded-full bg-[var(--hr-accent)]" />
          Ücretsiz SEO taraması
        </span>

        <h1 className="mt-6 text-[clamp(2.4rem,4.8vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-balance">
          SEO sağlığınız,
          <br />
          <span className="hr-accent">tek bakışta.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-base-content/60">
          Alan adınızı girin, sitenizi tarayıp sade bir sağlık karnesi ve 30
          günlük plan çıkaralım.
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
          aria-label="Alan adı"
          placeholder="siteniz.com"
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
          Tara
          <ArrowRight className="size-4" />
        </button>
      </div>

      <input
        type="email"
        autoComplete="email"
        aria-label="E-posta (opsiyonel)"
        placeholder="E-posta (opsiyonel)"
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

      <p className="text-sm text-base-content/45">
        Kayıt gerekmez, 50 sayfaya kadar, ~30 saniye
      </p>
    </form>
  );
}

function HeroShowcase() {
  return (
    <div className="hr-spotlight mx-auto w-full max-w-md lg:mr-0 lg:ml-auto">
      <div className="hr-reveal hr-tilt relative">
        <div className="hr-float">
          <HeroVisual />
        </div>

        <div className="hr-chip hr-chip-a absolute -top-6 left-6 z-10 hidden items-center gap-2 rounded-2xl px-3.5 py-2 sm:flex">
          <TrendingUp className="hr-accent size-4" />
          <span className="text-sm font-semibold">+14 puan</span>
          <span className="text-xs text-base-content/45">bu hafta</span>
        </div>

        <div className="hr-chip hr-chip-b absolute -bottom-6 right-6 z-10 hidden items-center gap-2 rounded-2xl px-3.5 py-2 sm:flex">
          <span className="size-2 rounded-full bg-warning" />
          <span className="text-sm font-semibold">3 sorun</span>
          <span className="text-xs text-base-content/45">bulundu</span>
        </div>
      </div>
    </div>
  );
}

const HERO_ISSUES = [
  {
    icon: AlertTriangle,
    label: "Eksik başlık",
    pages: "3 sayfa",
    cls: "text-error",
  },
  {
    icon: Link2,
    label: "Kırık bağlantı",
    pages: "2 sayfa",
    cls: "text-warning",
  },
];

function HeroVisual() {
  const tone = scoreTone(86);
  return (
    <div className="hr-surface overflow-hidden rounded-2xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-base-300 px-4 py-3">
        <span className="hr-dot" />
        <span className="hr-dot" />
        <span className="hr-dot" />
        <div className="ml-2 flex flex-1 items-center gap-1.5 truncate rounded-md bg-base-200/60 px-3 py-1 text-xs text-base-content/45">
          <Globe className="size-3" />
          siteniz.com — sağlık raporu
        </div>
      </div>

      {/* Report content */}
      <div className="p-6">
        <div className="flex items-center gap-5">
          <Gauge score={86} display={86} tone={tone} size="size-24" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/50">Sağlık skoru</span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                İyi
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              Siteniz sağlıklı
            </p>
            <p className="text-sm text-base-content/45">18 sayfa tarandı</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2.5 border-t border-base-300 pt-5">
          {HERO_ISSUES.map(({ icon: Icon, label, pages, cls }) => (
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

const SCAN_STATUS = [
  "Site haritası ve sayfalar keşfediliyor…",
  "Sayfalar taranıyor…",
  "Başlıklar ve bağlantılar kontrol ediliyor…",
  "Sağlık karneniz hazırlanıyor…",
];

function ScanningPanel() {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % SCAN_STATUS.length),
      1600,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <ScorecardSkeleton />
      <p
        key={step}
        className="hr-fade text-center text-sm text-base-content/55"
      >
        {SCAN_STATUS[step]}
      </p>
    </div>
  );
}
