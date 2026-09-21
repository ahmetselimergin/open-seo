import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import type { HealthReport, IssueSeverity } from "@/shared/health-report";

export const Route = createFileRoute("/health-report")({
  head: () => ({
    meta: [
      { title: "SEO Sağlık Raporu — OpenSEO" },
      {
        name: "description",
        content:
          "Alan adınızı girin, sitenizin ücretsiz SEO sağlık karnesini saniyeler içinde alın.",
      },
    ],
  }),
  component: HealthReportPage,
});

type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; report: HealthReport };

function HealthReportPage() {
  const [domain, setDomain] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [view, setView] = React.useState<ViewState>({ status: "idle" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!domain.trim() || view.status === "loading") return;
    setView({ status: "loading" });
    try {
      const response = await fetch("/api/health-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), email: email.trim() }),
      });
      const data: HealthReport | { error: string } = await response.json();
      if (!response.ok || "error" in data) {
        setView({
          status: "error",
          message:
            "error" in data ? data.error : "Beklenmeyen bir hata oluştu.",
        });
        return;
      }
      setView({ status: "done", report: data });
    } catch {
      setView({
        status: "error",
        message: "Bağlantı hatası. Lütfen tekrar deneyin.",
      });
    }
  };

  const reset = () => {
    setView({ status: "idle" });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <header className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">SEO Sağlık Raporu</h1>
        <p className="mt-3 text-base-content/60">
          Alan adınızı girin, sitenizin sağlık karnesini saniyeler içinde alın.
          Kayıt gerekmez.
        </p>
      </header>

      {view.status !== "done" && (
        <form
          onSubmit={submit}
          className="card mt-8 border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="card-body gap-4">
            <label className="form-control">
              <span className="label-text mb-1 font-medium">Alan adı</span>
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="örnek: siteniz.com"
                className="input input-bordered w-full"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={view.status === "loading"}
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1 font-medium">
                E-posta{" "}
                <span className="text-base-content/50">(opsiyonel)</span>
              </span>
              <input
                type="email"
                autoComplete="email"
                placeholder="siz@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={view.status === "loading"}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={view.status === "loading" || !domain.trim()}
            >
              {view.status === "loading" ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Sitiniz taranıyor…
                </>
              ) : (
                "Ücretsiz Raporu Al"
              )}
            </button>

            {view.status === "loading" && (
              <p className="text-center text-sm text-base-content/50">
                50 sayfaya kadar taranıyor, bu 30 saniye kadar sürebilir.
              </p>
            )}

            {view.status === "error" && (
              <div className="alert alert-error">
                <span>{view.message}</span>
              </div>
            )}
          </div>
        </form>
      )}

      {view.status === "done" && (
        <div className="mt-8 flex flex-col gap-8">
          <ScoreSection report={view.report} />
          <ProblemsSection report={view.report} />
          <ActionPlanSection report={view.report} />

          <div className="text-center">
            <button className="btn btn-outline" onClick={reset}>
              Yeni rapor oluştur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section A: Genel Sağlık Skoru ───────────────────────────────────────────
function ScoreSection({ report }: { report: HealthReport }) {
  const color = scoreColor(report.score);
  return (
    <section className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body items-center gap-4 text-center sm:flex-row sm:text-left">
        <div
          className={`radial-progress ${color} shrink-0`}
          style={
            {
              "--value": report.score,
              "--size": "8rem",
              "--thickness": "0.7rem",
            } as React.CSSProperties
          }
          role="progressbar"
          aria-valuenow={report.score}
        >
          <span className="text-3xl font-bold">{report.score}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h2 className="text-2xl font-bold">Genel Sağlık Skoru</h2>
            <span className={`badge ${badgeColor(report.score)}`}>
              {report.grade}
            </span>
          </div>
          <p className="mt-2 text-base-content/70">{report.summary}</p>
          <p className="mt-2 text-sm text-base-content/50">
            <span className="font-medium">{report.domain}</span> ·{" "}
            {report.pagesScanned} sayfa tarandı
            {report.truncated && " (ilk 50 sayfa)"}
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Section B: İlk 3 Problem ────────────────────────────────────────────────
function ProblemsSection({ report }: { report: HealthReport }) {
  if (report.topProblems.length === 0) {
    return (
      <section className="card border border-success/30 bg-success/5 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Tebrikler! 🎉</h2>
          <p className="text-base-content/70">
            Taranan sayfalarda acil bir sorun bulunamadı. Aşağıdaki plan
            sitenizi daha da güçlendirmenize yardımcı olur.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">
        Acil Düzeltilmesi Gereken İlk 3 Problem
      </h2>
      <div className="flex flex-col gap-4">
        {report.topProblems.map((problem, index) => (
          <div
            key={problem.issueType}
            className="card border border-base-300 bg-base-100 shadow-sm"
          >
            <div className="card-body gap-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold">
                  {index + 1}. {problem.title}
                </h3>
                <span className={`badge ${severityBadge(problem.severity)}`}>
                  {severityLabel(problem.severity)}
                </span>
              </div>
              <p className="text-sm text-base-content/50">
                {problem.affectedPages} sayfada tespit edildi
              </p>
              <div>
                <p className="text-sm font-medium text-base-content/80">
                  Ne anlama geliyor?
                </p>
                <p className="text-sm text-base-content/70">
                  {problem.whatItMeans}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-base-content/80">
                  Nasıl düzeltilir?
                </p>
                <p className="text-sm text-base-content/70">
                  {problem.howToFix}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Section C: 30 Günlük Eylem Planı ────────────────────────────────────────
function ActionPlanSection({ report }: { report: HealthReport }) {
  const [done, setDone] = React.useState<Set<number>>(new Set());
  const toggle = (index: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const weeks = [1, 2, 3, 4];
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">30 Günlük Hızlı Eylem Planı</h2>
      <div className="flex flex-col gap-4">
        {weeks.map((week) => {
          const items = report.actionPlan
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => item.week === week);
          if (items.length === 0) return null;
          return (
            <div
              key={week}
              className="card border border-base-300 bg-base-100 shadow-sm"
            >
              <div className="card-body gap-2">
                <h3 className="font-semibold text-base-content/80">
                  {weekLabel(week)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {items.map(({ item, index }) => (
                    <li key={index}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm mt-0.5"
                          checked={done.has(index)}
                          onChange={() => toggle(index)}
                        />
                        <span
                          className={
                            done.has(index)
                              ? "text-base-content/40 line-through"
                              : "text-base-content/80"
                          }
                        >
                          {item.task}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}
function badgeColor(score: number): string {
  if (score >= 75) return "badge-success";
  if (score >= 50) return "badge-warning";
  return "badge-error";
}
function severityBadge(severity: IssueSeverity): string {
  if (severity === "critical") return "badge-error";
  if (severity === "warning") return "badge-warning";
  return "badge-info";
}
function severityLabel(severity: IssueSeverity): string {
  if (severity === "critical") return "Acil";
  if (severity === "warning") return "Orta";
  return "Küçük";
}
function weekLabel(week: number): string {
  return `${week}. Hafta`;
}
