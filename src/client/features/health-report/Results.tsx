import * as React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download } from "lucide-react";
import type { HealthReport } from "@/shared/health-report";
import {
  scoreTone,
  severityTone,
  useCountUp,
} from "@/client/features/health-report/tones";
import { Gauge } from "@/client/features/health-report/Gauge";
import {
  MonitorCard,
  ShareButton,
} from "@/client/features/health-report/reportActions";

export function Results({
  report,
  onReset,
  shareId,
  shared = false,
}: {
  report: HealthReport;
  onReset?: () => void;
  /** When set, a "copy share link" button is shown for this report. */
  shareId?: string;
  /** True when viewing someone's shared report (read-only entry point). */
  shared?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="hr-in hr-no-print flex items-center justify-between gap-3">
        {shared ? (
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/60 transition-colors hover:text-base-content"
          >
            <ArrowLeft className="size-4" /> Kendi raporunu al
          </a>
        ) : (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/60 transition-colors hover:text-base-content"
          >
            <ArrowLeft className="size-4" /> Yeni rapor
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-base-300 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-base-100"
          >
            <Download className="size-4" /> İndir
          </button>
          {shareId && <ShareButton shareId={shareId} />}
        </div>
      </div>

      <ScoreCard report={report} />
      <ProblemsSection report={report} />
      <ActionPlanSection report={report} />
      <MonitorCard domain={report.domain} score={report.score} />
      <FooterCta />
    </div>
  );
}

function ScoreCard({ report }: { report: HealthReport }) {
  const value = useCountUp(report.score);
  const tone = scoreTone(report.score);
  return (
    <section
      className="hr-in rounded-2xl border border-base-300 bg-base-100 shadow-sm"
      style={{ animationDelay: "60ms" }}
    >
      <div className="flex flex-col items-center gap-6 p-7 sm:flex-row sm:gap-8 sm:p-9">
        <Gauge score={report.score} display={value} tone={tone} />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="text-2xl font-bold tracking-tight">
              Genel sağlık skoru
            </h2>
            <span
              className={`rounded-full border-0 px-2.5 py-0.5 text-sm font-semibold ${tone.badge}`}
            >
              {report.grade}
            </span>
          </div>
          <p className="mt-2 text-base-content/70">{report.summary}</p>
          <p className="mt-3 text-sm text-base-content/45">
            {report.pagesScanned} sayfa tarandı
            {report.truncated && " · ilk 50 sayfa"}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <CountPill
              n={report.issueCounts.critical}
              label="Acil"
              cls="bg-error/10 text-error"
            />
            <CountPill
              n={report.issueCounts.warning}
              label="Orta"
              cls="bg-warning/15 text-warning"
            />
            <CountPill
              n={report.issueCounts.info}
              label="Küçük"
              cls="bg-info/10 text-info"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CountPill({
  n,
  label,
  cls,
}: {
  n: number;
  label: string;
  cls: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cls}`}
    >
      <span className="font-bold tabular-nums">{n}</span> {label}
    </span>
  );
}

function ProblemsSection({ report }: { report: HealthReport }) {
  if (report.topProblems.length === 0) {
    return (
      <section
        className="hr-in flex items-start gap-3 rounded-2xl border border-success/30 bg-success/5 p-7"
        style={{ animationDelay: "120ms" }}
      >
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Sorun bulunamadı</h2>
          <p className="mt-1 text-base-content/70">
            Taranan sayfalarda acil bir sorun çıkmadı. Aşağıdaki plan sitenizi
            daha da güçlendirmenize yardımcı olur.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hr-in flex flex-col gap-4"
      style={{ animationDelay: "120ms" }}
    >
      <h2 className="text-2xl font-bold tracking-tight">Öncelikli 3 sorun</h2>
      {report.topProblems.map((problem, index) => (
        <ProblemCard key={problem.issueType} problem={problem} index={index} />
      ))}
    </section>
  );
}

function ProblemCard({
  problem,
  index,
}: {
  problem: HealthReport["topProblems"][number];
  index: number;
}) {
  const tone = severityTone(problem.severity);
  return (
    <article className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 transition-transform hover:-translate-y-0.5">
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} />
      <div className="flex flex-col gap-3 p-6 pl-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${tone.chip}`}
            >
              {index + 1}
            </span>
            <h3 className="text-lg font-semibold">{problem.title}</h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-medium ${tone.badge}`}
          >
            {tone.label}
          </span>
        </div>
        <p className="text-sm text-base-content/45">
          {problem.affectedPages} sayfada tespit edildi
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail title="Ne anlama geliyor?" body={problem.whatItMeans} />
          <Detail title="Nasıl düzeltilir?" body={problem.howToFix} />
        </div>
      </div>
    </article>
  );
}

function Detail({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-base-200/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
        {title}
      </p>
      <p className="mt-1 text-sm text-base-content/75">{body}</p>
    </div>
  );
}

type PlanItem = HealthReport["actionPlan"][number];

function ActionPlanSection({ report }: { report: HealthReport }) {
  const [done, setDone] = React.useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const total = report.actionPlan.length;
  const pct = total === 0 ? 0 : Math.round((done.size / total) * 100);
  const weeks = [1, 2, 3, 4];

  return (
    <section
      className="hr-in flex flex-col gap-4"
      style={{ animationDelay: "180ms" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">
          30 günlük eylem planı
        </h2>
        <span className="text-sm font-medium text-base-content/50">
          {done.size}/{total} tamamlandı
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-base-300">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "var(--hr-accent)" }}
        />
      </div>

      <div className="relative mt-2 flex flex-col gap-4 border-l-2 border-base-300 pl-6">
        {weeks.map((week) => {
          const items = report.actionPlan
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => item.week === week);
          if (items.length === 0) return null;
          return (
            <WeekBlock
              key={week}
              week={week}
              items={items}
              done={done}
              onToggle={toggle}
            />
          );
        })}
      </div>
    </section>
  );
}

function WeekBlock({
  week,
  items,
  done,
  onToggle,
}: {
  week: number;
  items: { item: PlanItem; index: number }[];
  done: Set<number>;
  onToggle: (i: number) => void;
}) {
  return (
    <div className="relative">
      <span
        className="absolute -left-[31px] top-1 grid size-5 place-items-center rounded-full border-2 bg-base-100 text-[10px] font-bold"
        style={{ borderColor: "var(--hr-accent)", color: "var(--hr-accent)" }}
      >
        {week}
      </span>
      <h3 className="mb-2 text-sm font-semibold text-base-content/60">
        {week}. hafta
      </h3>
      <div className="flex flex-col divide-y divide-base-200 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
        {items.map(({ item, index }) => {
          const checked = done.has(index);
          return (
            <label
              key={index}
              className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-base-200/50"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm mt-0.5"
                checked={checked}
                onChange={() => onToggle(index)}
              />
              <span
                className={
                  checked
                    ? "text-sm text-base-content/40 line-through"
                    : "text-sm text-base-content/80"
                }
              >
                {item.task}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function FooterCta() {
  return (
    <section
      className="hr-in flex flex-col items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-7 sm:flex-row sm:items-center sm:justify-between"
      style={{ animationDelay: "240ms" }}
    >
      <div>
        <h3 className="text-lg font-bold tracking-tight">
          Daha derin bir analiz mi istiyorsunuz?
        </h3>
        <p className="mt-1 max-w-md text-sm text-base-content/60">
          mySeo ile rakip analizi, anahtar kelime araştırması, sıralama takibi
          ve tam site denetimini tek yerde yapın.
        </p>
      </div>
      <a
        href="/"
        className="hr-cta inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
      >
        mySeo'yu keşfet
        <ArrowRight className="size-4" />
      </a>
    </section>
  );
}
