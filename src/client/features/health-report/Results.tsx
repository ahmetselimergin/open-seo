import * as React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download } from "lucide-react";
import { localizeReport, type HealthReport } from "@/shared/health-report";
import { useLang } from "@/client/features/health-report/i18n";
import {
  resultsCopy,
  type ResultsCopy,
} from "@/client/features/health-report/i18n-results";
import {
  scoreTone,
  severityTone,
  useCountUp,
} from "@/client/features/health-report/tones";
import { Gauge } from "@/client/features/health-report/Gauge";
import {
  BadgeEmbed,
  MonitorCard,
  ShareButton,
} from "@/client/features/health-report/reportActions";
import { ActionPlanSection } from "@/client/features/health-report/ResultsPlan";

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
  const { lang } = useLang();
  const t = resultsCopy(lang);
  const r = localizeReport(report, lang);

  return (
    <div className="flex flex-col gap-6">
      <div className="hr-in hr-no-print flex items-center justify-between gap-3">
        {shared ? (
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/60 transition-colors hover:text-base-content"
          >
            <ArrowLeft className="size-4" /> {t.getOwnReport}
          </a>
        ) : (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/60 transition-colors hover:text-base-content"
          >
            <ArrowLeft className="size-4" /> {t.newReport}
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-base-300 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-base-100"
          >
            <Download className="size-4" /> {t.download}
          </button>
          {shareId && <ShareButton shareId={shareId} />}
        </div>
      </div>

      <ScoreCard report={r} t={t} />
      <ProblemsSection report={r} t={t} lang={lang} />
      <ActionPlanSection report={r} t={t} />
      <MonitorCard domain={r.domain} score={r.score} />
      {shareId && <BadgeEmbed shareId={shareId} />}
      <FooterCta t={t} />
    </div>
  );
}

function ScoreCard({ report, t }: { report: HealthReport; t: ResultsCopy }) {
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
              {t.overallScore}
            </h2>
            <span
              className={`rounded-full border-0 px-2.5 py-0.5 text-sm font-semibold ${tone.badge}`}
            >
              {report.grade}
            </span>
          </div>
          <p className="mt-2 text-base-content/70">{report.summary}</p>
          <p className="mt-3 text-sm text-base-content/45">
            {t.pagesScanned(report.pagesScanned)}
            {report.truncated && t.firstN(50)}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <CountPill
              n={report.issueCounts.critical}
              label={t.critical}
              cls="bg-error/10 text-error"
            />
            <CountPill
              n={report.issueCounts.warning}
              label={t.warning}
              cls="bg-warning/15 text-warning"
            />
            <CountPill
              n={report.issueCounts.info}
              label={t.info}
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

function ProblemsSection({
  report,
  t,
  lang,
}: {
  report: HealthReport;
  t: ResultsCopy;
  lang: "tr" | "en";
}) {
  if (report.topProblems.length === 0) {
    return (
      <section
        className="hr-in flex items-start gap-3 rounded-2xl border border-success/30 bg-success/5 p-7"
        style={{ animationDelay: "120ms" }}
      >
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {t.noIssuesTitle}
          </h2>
          <p className="mt-1 text-base-content/70">{t.noIssuesBody}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hr-in flex flex-col gap-4"
      style={{ animationDelay: "120ms" }}
    >
      <h2 className="text-2xl font-bold tracking-tight">{t.topProblems}</h2>
      {report.topProblems.map((problem, index) => (
        <ProblemCard
          key={problem.issueType}
          problem={problem}
          index={index}
          t={t}
          lang={lang}
        />
      ))}
    </section>
  );
}

function ProblemCard({
  problem,
  index,
  t,
  lang,
}: {
  problem: HealthReport["topProblems"][number];
  index: number;
  t: ResultsCopy;
  lang: "tr" | "en";
}) {
  const tone = severityTone(problem.severity, lang);
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
          {t.detectedOn(problem.affectedPages)}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail title={t.whatItMeans} body={problem.whatItMeans} />
          <Detail title={t.howToFix} body={problem.howToFix} />
        </div>
        {problem.examplePages.length > 0 && (
          <AffectedPages problem={problem} t={t} />
        )}
        <a
          href={`/rehber#${problem.issueType}`}
          className="hr-accent w-fit text-sm font-medium hover:underline"
        >
          {t.detailedGuide}
        </a>
      </div>
    </article>
  );
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = `${u.pathname}${u.search}`;
    return path === "/" ? u.host : `${u.host}${path}`;
  } catch {
    return url;
  }
}

function AffectedPages({
  problem,
  t,
}: {
  problem: HealthReport["topProblems"][number];
  t: ResultsCopy;
}) {
  const remaining = problem.affectedPages - problem.examplePages.length;
  return (
    <div className="rounded-xl bg-base-200/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
        {t.affectedPagesLabel}
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {problem.examplePages.map((url) => (
          <li key={url} className="truncate text-sm text-base-content/70">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-base-content hover:underline"
            >
              {shortUrl(url)}
            </a>
          </li>
        ))}
      </ul>
      {remaining > 0 && (
        <p className="mt-1 text-xs text-base-content/45">
          {t.moreCount(remaining)}
        </p>
      )}
    </div>
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

function FooterCta({ t }: { t: ResultsCopy }) {
  return (
    <section
      className="hr-in flex flex-col items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-7 sm:flex-row sm:items-center sm:justify-between"
      style={{ animationDelay: "240ms" }}
    >
      <div>
        <h3 className="text-lg font-bold tracking-tight">{t.footerHeading}</h3>
        <p className="mt-1 max-w-md text-sm text-base-content/60">
          {t.footerBody}
        </p>
      </div>
      <a
        href="/"
        className="hr-cta inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
      >
        {t.footerButton}
        <ArrowRight className="size-4" />
      </a>
    </section>
  );
}
