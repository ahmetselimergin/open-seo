import * as React from "react";
import type { HealthReport } from "@/shared/health-report";
import type { ResultsCopy } from "@/client/features/health-report/i18n-results";

type PlanItem = HealthReport["actionPlan"][number];

/** The 30-day action plan with per-item checkboxes and a progress bar. */
export function ActionPlanSection({
  report,
  t,
}: {
  report: HealthReport;
  t: ResultsCopy;
}) {
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
        <h2 className="text-2xl font-bold tracking-tight">{t.planHeading}</h2>
        <span className="text-sm font-medium text-base-content/50">
          {t.completed(done.size, total)}
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
              t={t}
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
  t,
}: {
  week: number;
  items: { item: PlanItem; index: number }[];
  done: Set<number>;
  onToggle: (i: number) => void;
  t: ResultsCopy;
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
        {t.weekLabel(week)}
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
