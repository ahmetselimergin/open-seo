import * as React from "react";
import { Swords } from "lucide-react";
import type { HealthReport } from "@/shared/health-report";
import { scoreTone } from "@/client/features/health-report/tones";
import { Gauge } from "@/client/features/health-report/Gauge";
import {
  Backdrop,
  PageStyles,
  ScorecardSkeleton,
} from "@/client/features/health-report/visuals";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; a: HealthReport; b: HealthReport };

export function ComparePage() {
  const [you, setYou] = React.useState("");
  const [rival, setRival] = React.useState("");
  const [view, setView] = React.useState<State>({ status: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!you.trim() || !rival.trim() || view.status === "loading") return;
    setView({ status: "loading" });
    try {
      const res = await fetch("/api/health-report/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: you.trim(),
          competitor: rival.trim(),
        }),
      });
      const data: { a: HealthReport; b: HealthReport } | { error: string } =
        await res.json();
      if (!res.ok || "error" in data) {
        setView({
          status: "error",
          message:
            "error" in data ? data.error : "Beklenmeyen bir hata oluştu.",
        });
        return;
      }
      setView({ status: "done", a: data.a, b: data.b });
    } catch {
      setView({ status: "error", message: "Bağlantı hatası, tekrar deneyin." });
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
          <a
            href="/"
            className="text-sm text-base-content/60 hover:text-base-content"
          >
            Tek site tara
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 pb-28 pt-10">
        <div className="text-center">
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            İki siteyi <span className="hr-accent">karşılaştır</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base-content/60">
            Seninki ile rakibini yan yana koy; kim önde, nerede geride gör.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium">Senin siten</span>
            <input
              type="text"
              inputMode="url"
              placeholder="siteniz.com"
              className="hr-field w-full rounded-2xl border border-base-300 px-4 py-3 outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35"
              value={you}
              onChange={(e) => setYou(e.target.value)}
              required
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium">Rakip</span>
            <input
              type="text"
              inputMode="url"
              placeholder="rakip.com"
              className="hr-field w-full rounded-2xl border border-base-300 px-4 py-3 outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35"
              value={rival}
              onChange={(e) => setRival(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="hr-cta inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold disabled:opacity-50"
            disabled={view.status === "loading"}
          >
            {view.status === "loading" ? (
              "Taranıyor…"
            ) : (
              <>
                <Swords className="size-4" /> Karşılaştır
              </>
            )}
          </button>
        </form>

        {view.status === "error" && (
          <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-center text-sm text-error">
            {view.message}
          </p>
        )}

        {view.status === "loading" && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <ScorecardSkeleton />
            <ScorecardSkeleton />
          </div>
        )}

        {view.status === "done" && (
          <div className="mt-10">
            <Verdict a={view.a} b={view.b} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <CompareColumn
                report={view.a}
                win={view.a.score >= view.b.score}
              />
              <CompareColumn
                report={view.b}
                win={view.b.score > view.a.score}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Verdict({ a, b }: { a: HealthReport; b: HealthReport }) {
  const diff = a.score - b.score;
  const text =
    diff > 0
      ? `Öndesin! ${a.domain}, ${b.domain} sitesinden ${diff} puan yüksek.`
      : diff < 0
        ? `Rakip önde: ${b.domain}, seninkinden ${-diff} puan yüksek.`
        : "Başa baş! İki site de aynı skorda.";
  return (
    <div className="hr-surface rounded-2xl p-5 text-center text-lg font-semibold">
      {text}
    </div>
  );
}

function CompareColumn({
  report,
  win,
}: {
  report: HealthReport;
  win: boolean;
}) {
  const tone = scoreTone(report.score);
  return (
    <div
      className={`hr-surface rounded-3xl p-6 ${win ? "ring-2 ring-[var(--hr-accent)]" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-base-content/60">
          {report.domain}
        </span>
        {win && (
          <span className="hr-accent shrink-0 rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs font-semibold">
            Önde
          </span>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <Gauge score={report.score} display={report.score} tone={tone} />
      </div>
      <p className="mt-3 text-center text-sm text-base-content/45">
        {report.pagesScanned} sayfa · {report.grade}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-error/10 px-3 py-1 text-sm font-medium text-error">
          {report.issueCounts.critical} Acil
        </span>
        <span className="rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning">
          {report.issueCounts.warning} Orta
        </span>
      </div>
      {report.topProblems.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 border-t border-base-300 pt-4">
          {report.topProblems.map((p) => (
            <li
              key={p.issueType}
              className="flex items-center gap-2 text-sm text-base-content/70"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-base-content/30" />
              {p.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
