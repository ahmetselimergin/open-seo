import * as React from "react";
import type { HealthReport } from "@/shared/health-report";
import { Hero } from "@/client/features/health-report/HeroForm";
import { LandingSections } from "@/client/features/health-report/LandingSections";
import { Results } from "@/client/features/health-report/Results";
import { Backdrop, PageStyles } from "@/client/features/health-report/visuals";

type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; report: HealthReport; id?: string };

/** The public mySeo homepage: landing + single-click SEO health report. */
export function HomePage() {
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
      const data: (HealthReport & { id?: string }) | { error: string } =
        await response.json();
      if (!response.ok || "error" in data) {
        setView({
          status: "error",
          message:
            "error" in data ? data.error : "Beklenmeyen bir hata oluştu.",
        });
        return;
      }
      setView({ status: "done", report: data, id: data.id });
    } catch {
      setView({
        status: "error",
        message: "Bağlantı hatası. Lütfen tekrar deneyin.",
      });
    }
  };

  const showingReport = view.status === "done";

  return (
    <div className="hr-root relative h-dvh overflow-y-auto bg-base-200 text-base-content">
      <PageStyles />
      <Backdrop />

      <header className="hr-nav hr-no-print sticky top-0 z-20">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <span className="text-lg font-bold tracking-tight">
            my<span className="hr-accent">Seo</span>
          </span>
          <nav className="flex gap-5 text-sm text-base-content/60">
            <a
              href="/araclar"
              className="transition-colors hover:text-base-content"
            >
              Araçlar
            </a>
            <a
              href="/karsilastir"
              className="transition-colors hover:text-base-content"
            >
              Karşılaştır
            </a>
            <a
              href="/hesap"
              className="transition-colors hover:text-base-content"
            >
              Hesabım
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-28 pt-6">
        {showingReport ? (
          <div className="mx-auto max-w-3xl">
            <Results
              report={view.report}
              shareId={view.id}
              onReset={() => setView({ status: "idle" })}
            />
          </div>
        ) : (
          <>
            <Hero
              domain={domain}
              email={email}
              onDomain={setDomain}
              onEmail={setEmail}
              onSubmit={submit}
              isLoading={view.status === "loading"}
              error={view.status === "error" ? view.message : null}
            />
            {view.status !== "loading" && <LandingSections />}
          </>
        )}
      </main>
    </div>
  );
}
