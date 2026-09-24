import * as React from "react";
import type { IssueSeverity, ReportLang } from "@/shared/health-report";

/** Count a number up from 0 with an easeOutCubic curve on mount. */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export interface ScoreTone {
  from: string;
  to: string;
  badge: string;
}

/** Gauge gradient + grade-badge colors keyed to the score band. */
export function scoreTone(score: number): ScoreTone {
  if (score >= 75) {
    return {
      from: "oklch(75% 0.16 150)",
      to: "oklch(62% 0.19 150)",
      badge: "bg-success text-success-content",
    };
  }
  if (score >= 50) {
    return {
      from: "oklch(85% 0.15 85)",
      to: "oklch(75% 0.16 70)",
      badge: "bg-warning text-warning-content",
    };
  }
  return {
    from: "oklch(72% 0.18 30)",
    to: "oklch(62% 0.22 25)",
    badge: "bg-error text-error-content",
  };
}

export interface SeverityTone {
  label: string;
  bar: string;
  chip: string;
  badge: string;
}

const SEVERITY_LABELS: Record<ReportLang, Record<IssueSeverity, string>> = {
  tr: { critical: "Acil", warning: "Orta", info: "Küçük" },
  en: { critical: "Urgent", warning: "Moderate", info: "Minor" },
};

/** Accent colors for a problem card, keyed to issue severity. */
export function severityTone(
  severity: IssueSeverity,
  lang: ReportLang = "tr",
): SeverityTone {
  const label = SEVERITY_LABELS[lang][severity];
  if (severity === "critical") {
    return {
      label,
      bar: "bg-error",
      chip: "bg-error/15 text-error",
      badge: "bg-error/10 text-error",
    };
  }
  if (severity === "warning") {
    return {
      label,
      bar: "bg-warning",
      chip: "bg-warning/20 text-warning",
      badge: "bg-warning/15 text-warning",
    };
  }
  return {
    label,
    bar: "bg-info",
    chip: "bg-info/15 text-info",
    badge: "bg-info/10 text-info",
  };
}
