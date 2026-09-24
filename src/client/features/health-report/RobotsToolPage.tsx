import * as React from "react";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Backdrop, PageStyles } from "@/client/features/health-report/visuals";
import {
  LanguageSwitcher,
  LangProvider,
  useLang,
} from "@/client/features/health-report/i18n";
import { toolsCopy } from "@/client/features/health-report/i18n-tools";

interface SitemapInfo {
  url: string;
  found: boolean;
  urlCount: number;
  isIndex: boolean;
}
interface RobotsResult {
  robotsFound: boolean;
  blocksAll: boolean;
  robotsPreview: string | null;
  sitemaps: SitemapInfo[];
}
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: RobotsResult };

export function RobotsToolPage() {
  return (
    <LangProvider>
      <RobotsInner />
    </LangProvider>
  );
}

function RobotsInner() {
  const t = toolsCopy(useLang().lang);
  const c = t.robots;
  const [domain, setDomain] = React.useState("");
  const [view, setView] = React.useState<State>({ status: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || view.status === "loading") return;
    setView({ status: "loading" });
    try {
      const res = await fetch("/api/tools/robots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data: RobotsResult | { error: string } = await res.json();
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
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
          />
          <button
            type="submit"
            className="hr-cta inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3.5 font-semibold disabled:opacity-50"
            disabled={view.status === "loading"}
          >
            <Search className="size-4" />
            {view.status === "loading" ? t.loading : t.check}
          </button>
        </form>

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

function Results({ result }: { result: RobotsResult }) {
  const c = toolsCopy(useLang().lang).robots;
  const totalUrls = result.sitemaps.reduce((s, m) => s + m.urlCount, 0);
  const anySitemap = result.sitemaps.some((m) => m.found);
  const checks = [
    {
      ok: result.robotsFound,
      label: c.lRobots,
      detail: c.dRobots(result.robotsFound),
    },
    {
      ok: !result.blocksAll,
      label: c.lOpen,
      detail: c.dOpen(result.blocksAll),
    },
    {
      ok: anySitemap,
      label: c.lSitemap,
      detail: c.dSitemap(anySitemap, totalUrls),
    },
  ];

  return (
    <div className="mt-10 flex flex-col gap-6">
      <section className="hr-in hr-surface rounded-3xl p-6">
        <h2 className="mb-4 text-sm font-semibold text-base-content/50">
          {c.checks}
        </h2>
        <div className="flex flex-col divide-y divide-base-300">
          {checks.map((k) => (
            <div key={k.label} className="flex items-start gap-3 py-3">
              {k.ok ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              ) : (
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              )}
              <div>
                <p className="font-medium">{k.label}</p>
                <p className="text-sm text-base-content/55">{k.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {anySitemap && (
        <section
          className="hr-in hr-surface rounded-3xl p-6"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="mb-3 text-sm font-semibold text-base-content/50">
            {c.sitemaps}
          </h2>
          <div className="flex flex-col gap-2">
            {result.sitemaps
              .filter((m) => m.found)
              .map((m) => (
                <div
                  key={m.url}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate text-base-content/70">{m.url}</span>
                  <span className="shrink-0 text-base-content/45">
                    {c.sitemapCount(m.isIndex, m.urlCount)}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {result.robotsPreview && (
        <section
          className="hr-in hr-surface rounded-3xl p-6"
          style={{ animationDelay: "160ms" }}
        >
          <h2 className="mb-3 text-sm font-semibold text-base-content/50">
            {c.robotsFile}
          </h2>
          <pre className="overflow-x-auto rounded-xl bg-base-200/60 p-4 font-mono text-xs whitespace-pre-wrap text-base-content/70">
            {result.robotsPreview}
          </pre>
        </section>
      )}
    </div>
  );
}
