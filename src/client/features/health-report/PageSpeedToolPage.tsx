import * as React from "react";
import { Gauge } from "@/client/features/health-report/Gauge";
import { scoreTone } from "@/client/features/health-report/tones";
import { Backdrop, PageStyles } from "@/client/features/health-report/visuals";
import {
  LanguageSwitcher,
  LangProvider,
  useLang,
} from "@/client/features/health-report/i18n";
import { toolsCopy } from "@/client/features/health-report/i18n-tools";

interface Metric {
  id: string;
  numericValue: number;
  displayValue: string;
}
interface SpeedResult {
  url: string;
  score: number;
  metrics: Metric[];
}
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: SpeedResult };

// [good ceiling, poor floor] per metric (mobile lab thresholds).
const THRESHOLDS: Record<string, [number, number]> = {
  "largest-contentful-paint": [2500, 4000],
  "cumulative-layout-shift": [0.1, 0.25],
  "total-blocking-time": [200, 600],
  "first-contentful-paint": [1800, 3000],
  "speed-index": [3400, 5800],
};
function rating(id: string, v: number): "good" | "avg" | "poor" {
  const t = THRESHOLDS[id];
  if (!t) return "avg";
  if (v <= t[0]) return "good";
  if (v > t[1]) return "poor";
  return "avg";
}
const RATING_CLS: Record<string, string> = {
  good: "text-success",
  avg: "text-warning",
  poor: "text-error",
};

export function PageSpeedToolPage() {
  return (
    <LangProvider>
      <SpeedInner />
    </LangProvider>
  );
}

function SpeedInner() {
  const t = toolsCopy(useLang().lang);
  const c = t.speed;
  const [url, setUrl] = React.useState("");
  const [view, setView] = React.useState<State>({ status: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || view.status === "loading") return;
    setView({ status: "loading" });
    try {
      const res = await fetch("/api/tools/pagespeed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data: SpeedResult | { error: string } = await res.json();
      if (!res.ok || "error" in data) {
        setView({
          status: "error",
          message: "error" in data ? data.error : t.genericError,
        });
        return;
      }
      setView({ status: "done", result: data });
    } catch {
      setView({ status: "error", message: t.connError });
    }
  };

  return (
    <div className="hr-root relative h-dvh overflow-y-auto bg-base-200 text-base-content">
      <PageStyles />
      <Backdrop />
      <header className="hr-nav sticky top-0 z-20">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <a href="/" className="text-lg font-bold tracking-tight">
            my<span className="hr-accent">Seo</span>
          </a>
          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <a href="/araclar" className="hover:text-base-content">
              {t.allTools}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10">
        <div className="text-center">
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            {c.title} <span className="hr-accent">{c.accent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base-content/60">
            {c.subtitle}
          </p>
        </div>

        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-xl gap-2">
          <input
            type="text"
            inputMode="url"
            placeholder={c.placeholder}
            className="hr-field w-full rounded-2xl border border-base-300 px-4 py-3.5 text-base outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="hr-cta inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3.5 font-semibold disabled:opacity-50"
            disabled={view.status === "loading"}
          >
            {view.status === "loading" ? c.measuring : c.measure}
          </button>
        </form>

        {view.status === "loading" && (
          <p className="mt-4 text-center text-sm text-base-content/50">
            {c.loadingNote}
          </p>
        )}
        {view.status === "error" && (
          <p className="mx-auto mt-4 max-w-xl rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-center text-sm text-error">
            {view.message}
          </p>
        )}

        {view.status === "done" && <Results result={view.result} />}
      </main>
    </div>
  );
}

function Results({ result }: { result: SpeedResult }) {
  const c = toolsCopy(useLang().lang).speed;
  const tone = scoreTone(result.score);
  return (
    <div className="mt-10 flex flex-col gap-6">
      <section className="hr-in hr-surface flex items-center gap-6 rounded-3xl p-7">
        <Gauge score={result.score} display={result.score} tone={tone} />
        <div>
          <h2 className="text-xl font-bold tracking-tight">{c.scoreHeading}</h2>
          <p className="mt-1 text-base-content/60">{c.scoreNote}</p>
        </div>
      </section>

      {result.metrics.length > 0 && (
        <section
          className="hr-in grid gap-4 sm:grid-cols-2"
          style={{ animationDelay: "80ms" }}
        >
          {result.metrics.map((m) => {
            const r = rating(m.id, m.numericValue);
            return (
              <div key={m.id} className="hr-surface rounded-2xl p-5">
                <p className="text-sm text-base-content/55">
                  {c.labels[m.id] ?? m.id}
                </p>
                <p className={`mt-1 text-2xl font-bold ${RATING_CLS[r]}`}>
                  {m.displayValue}
                </p>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
