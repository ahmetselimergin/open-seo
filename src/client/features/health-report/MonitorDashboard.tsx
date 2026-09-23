import * as React from "react";
import { ArrowRight, BellOff } from "lucide-react";
import { scoreTone } from "@/client/features/health-report/tones";
import { Gauge } from "@/client/features/health-report/Gauge";
import {
  Backdrop,
  PageStyles,
  ScorecardSkeleton,
} from "@/client/features/health-report/visuals";

interface ScorePoint {
  date: string;
  score: number;
}
interface MonitorView {
  domain: string;
  lastScore: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
  history: ScorePoint[];
  unsubToken: string;
}

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; monitor: MonitorView };

export function MonitorDashboard({ token }: { token: string }) {
  const [state, setState] = React.useState<State>({ status: "loading" });

  React.useEffect(() => {
    let active = true;
    fetch(`/api/health-report/monitor/${token}`)
      .then(async (r) => {
        const data: MonitorView | { error: string } = await r.json();
        if (!active) return;
        if (!r.ok || "error" in data) setState({ status: "error" });
        else setState({ status: "done", monitor: data });
      })
      .catch(() => active && setState({ status: "error" }));
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="hr-root relative h-dvh overflow-y-auto bg-base-200 text-base-content">
      <PageStyles />
      <Backdrop />
      <header className="hr-nav sticky top-0 z-20">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-5">
          <a href="/" className="text-lg font-bold tracking-tight">
            my<span className="hr-accent">Seo</span>
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10">
        {state.status === "loading" && (
          <div className="hr-in">
            <ScorecardSkeleton />
          </div>
        )}
        {state.status === "error" && <NotFound />}
        {state.status === "done" && <Dashboard monitor={state.monitor} />}
      </main>
    </div>
  );
}

function Dashboard({ monitor }: { monitor: MonitorView }) {
  const tone = scoreTone(monitor.lastScore ?? 0);
  return (
    <div className="flex flex-col gap-6">
      <div className="hr-in flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {monitor.domain}{" "}
          <span className="text-base font-normal text-base-content/45">
            izleme paneli
          </span>
        </h1>
        <span className="text-sm text-base-content/45">
          {monitor.lastCheckedAt
            ? `Son kontrol: ${formatDate(monitor.lastCheckedAt)}`
            : "Henüz kontrol edilmedi"}
        </span>
      </div>

      <section className="hr-in hr-surface flex items-center gap-6 rounded-3xl p-7">
        {monitor.lastScore !== null ? (
          <Gauge
            score={monitor.lastScore}
            display={monitor.lastScore}
            tone={tone}
          />
        ) : (
          <div className="grid size-36 place-items-center rounded-full border border-base-300 text-base-content/40">
            —
          </div>
        )}
        <div>
          <p className="text-sm text-base-content/50">Güncel skor</p>
          <p className="text-lg text-base-content/70">
            Haftalık olarak otomatik taranıyor. Skor değiştiğinde e-posta
            gönderiyoruz.
          </p>
        </div>
      </section>

      <section
        className="hr-in hr-surface rounded-3xl p-7"
        style={{ animationDelay: "80ms" }}
      >
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Skor geçmişi
        </h2>
        <TrendChart points={monitor.history} />
      </section>

      <div
        className="hr-in flex flex-wrap gap-3"
        style={{ animationDelay: "140ms" }}
      >
        <a
          href="/"
          className="hr-cta inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          Yeni tarama <ArrowRight className="size-4" />
        </a>
        <a
          href={`/api/health-report/monitor/unsubscribe?token=${monitor.unsubToken}`}
          className="inline-flex items-center gap-2 rounded-xl border border-base-300 px-5 py-3 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-100"
        >
          <BellOff className="size-4" /> İzlemeyi durdur
        </a>
      </div>
    </div>
  );
}

function TrendChart({ points }: { points: ScorePoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-base-content/50">
        Grafik için en az iki kontrol gerekir. İlk haftalık kontrolden sonra
        skor eğrisi burada belirecek.
      </p>
    );
  }
  const w = 600;
  const h = 180;
  const pad = 24;
  const n = points.length;
  const x = (i: number) => pad + (i / (n - 1)) * (w - 2 * pad);
  const y = (s: number) => pad + (1 - s / 100) * (h - 2 * pad);
  const line = points.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const area = `M ${x(0)},${h - pad} L ${line
    .split(" ")
    .join(" L ")} L ${x(n - 1)},${h - pad} Z`;
  const last = points[n - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      role="img"
      aria-label="Skor geçmişi grafiği"
    >
      <defs>
        <linearGradient id="hr-trend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--hr-accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--hr-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={y(g)}
          y2={y(g)}
          stroke="var(--color-base-300)"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#hr-trend)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--hr-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(p.score)}
          r={i === n - 1 ? 4 : 2.5}
          fill="var(--hr-accent)"
        />
      ))}
      <text
        x={x(n - 1)}
        y={y(last.score) - 10}
        textAnchor="end"
        fill="var(--color-base-content)"
        fontSize="14"
        fontWeight="700"
      >
        {last.score}
      </text>
    </svg>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function NotFound() {
  return (
    <div className="hr-in hr-surface mx-auto max-w-lg rounded-3xl p-10 text-center">
      <h1 className="text-2xl font-bold tracking-tight">İzleme bulunamadı</h1>
      <p className="mt-2 text-base-content/60">
        Bu izleme bağlantısı geçersiz ya da abonelik durdurulmuş olabilir.
      </p>
      <a
        href="/"
        className="hr-cta mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-semibold"
      >
        Kendi raporunu al <ArrowRight className="size-4.5" />
      </a>
    </div>
  );
}
