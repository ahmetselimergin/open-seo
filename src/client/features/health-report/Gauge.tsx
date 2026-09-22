import type { ScoreTone } from "@/client/features/health-report/tones";

/**
 * Circular score gauge with a themed gradient arc. Shared by the results
 * scorecard and the hero sample preview. `display` is the (optionally
 * animated) number shown in the center; `animate` draws the arc on mount.
 */
export function Gauge({
  score,
  display,
  tone,
  size = "size-36",
  animate = true,
}: {
  score: number;
  display: number;
  tone: ScoreTone;
  size?: string;
  animate?: boolean;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const gradientId = `hr-gauge-${score}`;
  return (
    <div className={`relative shrink-0 ${size}`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tone.from} />
            <stop offset="100%" stopColor={tone.to} />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          className="text-base-300"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={animate ? "hr-gauge-arc" : undefined}
          style={{ filter: `drop-shadow(0 0 7px ${tone.to})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums tracking-tight">
          {display}
        </span>
        <span className="text-xs font-medium text-base-content/40">/ 100</span>
      </div>
    </div>
  );
}
