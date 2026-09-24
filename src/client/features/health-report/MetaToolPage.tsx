import * as React from "react";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Backdrop, PageStyles } from "@/client/features/health-report/visuals";
import {
  LanguageSwitcher,
  LangProvider,
  useLang,
} from "@/client/features/health-report/i18n";
import { toolsCopy } from "@/client/features/health-report/i18n-tools";

interface MetaResult {
  url: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  h1Count: number;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  isIndexable: boolean;
}
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: MetaResult };

export function MetaToolPage() {
  return (
    <LangProvider>
      <MetaInner />
    </LangProvider>
  );
}

function MetaInner() {
  const t = toolsCopy(useLang().lang);
  const c = t.meta;
  const [url, setUrl] = React.useState("");
  const [view, setView] = React.useState<State>({ status: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || view.status === "loading") return;
    setView({ status: "loading" });
    try {
      const res = await fetch("/api/tools/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data: MetaResult | { error: string } = await res.json();
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

function Results({ result }: { result: MetaResult }) {
  const c = toolsCopy(useLang().lang).meta;
  const host = safeHost(result.url);
  const title = result.title || c.noTitle;
  const desc = result.metaDescription || c.noDesc;
  return (
    <div className="mt-10 flex flex-col gap-6">
      <section className="hr-in hr-surface rounded-3xl p-6">
        <h2 className="mb-3 text-sm font-semibold text-base-content/50">
          {c.googlePreview}
        </h2>
        <p className="text-xs text-base-content/50">{host}</p>
        <p className="mt-1 text-lg text-[#8ab4f8]">{truncate(title, 60)}</p>
        <p className="mt-1 text-sm text-base-content/60">
          {truncate(desc, 155)}
        </p>
      </section>

      <section
        className="hr-in hr-surface overflow-hidden rounded-3xl"
        style={{ animationDelay: "80ms" }}
      >
        <h2 className="px-6 pt-6 text-sm font-semibold text-base-content/50">
          {c.socialPreview}
        </h2>
        {result.ogImage && (
          <img
            src={result.ogImage}
            alt=""
            className="mt-3 max-h-64 w-full object-cover"
          />
        )}
        <div className="p-6 pt-4">
          <p className="text-xs uppercase text-base-content/40">{host}</p>
          <p className="mt-1 font-semibold">{result.ogTitle || title}</p>
          <p className="mt-1 text-sm text-base-content/60">
            {truncate(result.ogDescription || desc, 120)}
          </p>
        </div>
      </section>

      <section
        className="hr-in hr-surface rounded-3xl p-6"
        style={{ animationDelay: "160ms" }}
      >
        <h2 className="mb-4 text-sm font-semibold text-base-content/50">
          {c.checks}
        </h2>
        <div className="flex flex-col divide-y divide-base-300">
          {buildChecks(result, c).map((k) => (
            <Check key={k.label} {...k} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface CheckItem {
  label: string;
  ok: boolean;
  detail: string;
}

function Check({ label, ok, detail }: CheckItem) {
  return (
    <div className="flex items-start gap-3 py-3">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
      ) : (
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
      )}
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-base-content/55">{detail}</p>
      </div>
    </div>
  );
}

function buildChecks(
  r: MetaResult,
  c: ReturnType<typeof toolsCopy>["meta"],
): CheckItem[] {
  const tLen = r.title.length;
  const dLen = r.metaDescription.length;
  return [
    {
      label: c.lTitle,
      ok: tLen >= 10 && tLen <= 60,
      detail: c.dTitle(tLen, Boolean(r.title)),
    },
    {
      label: c.lDesc,
      ok: dLen >= 70 && dLen <= 160,
      detail: c.dDesc(dLen, Boolean(r.metaDescription)),
    },
    { label: c.lH1, ok: r.h1Count === 1, detail: c.dH1(r.h1Count) },
    {
      label: c.lCanonical,
      ok: Boolean(r.canonicalUrl),
      detail: c.dCanonical(r.canonicalUrl),
    },
    { label: c.lOg, ok: Boolean(r.ogImage), detail: c.dOg(Boolean(r.ogImage)) },
    {
      label: c.lIndexable,
      ok: r.isIndexable,
      detail: c.dIndexable(r.isIndexable),
    },
  ];
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
