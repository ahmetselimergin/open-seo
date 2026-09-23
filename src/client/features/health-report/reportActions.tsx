import * as React from "react";
import { Bell, Check, Code, Link2 } from "lucide-react";

/** Copy-share-link button shown on a report. */
export function ShareButton({ shareId }: { shareId: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    const url = `${window.location.origin}/report/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Rapor bağlantısı:", url);
    }
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-base-300 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-base-100"
    >
      {copied ? (
        <>
          <Check className="hr-accent size-4" /> Kopyalandı
        </>
      ) : (
        <>
          <Link2 className="size-4" /> Paylaş
        </>
      )}
    </button>
  );
}

/** Copy-paste embed badge for a shared report (drives backlinks). */
export function BadgeEmbed({ shareId }: { shareId: string }) {
  const [copied, setCopied] = React.useState(false);
  const [origin, setOrigin] = React.useState("");
  React.useEffect(() => setOrigin(window.location.origin), []);

  const snippet = `<a href="${origin}/report/${shareId}" target="_blank" rel="noopener">\n  <img src="${origin}/report/${shareId}/badge.svg" alt="mySeo SEO Skoru" width="212" height="56"/>\n</a>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Rozet kodu:", snippet);
    }
  };

  return (
    <section
      className="hr-no-print hr-in flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-6"
      style={{ animationDelay: "260ms" }}
    >
      <div>
        <h3 className="font-bold tracking-tight">Rozeti sitene ekle</h3>
        <p className="mt-0.5 text-sm text-base-content/60">
          Skorunu sitende göster, ziyaretçilerin güvenini kazan.
        </p>
      </div>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {origin && (
          <img
            src={`${origin}/report/${shareId}/badge.svg`}
            alt="mySeo SEO Skoru"
            width={212}
            height={56}
            className="shrink-0"
          />
        )}
        <div className="w-full flex-1">
          <pre className="overflow-x-auto rounded-xl bg-base-200/60 p-3 font-mono text-xs whitespace-pre text-base-content/70">
            {snippet}
          </pre>
          <button
            onClick={copy}
            className="hr-cta mt-2 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            {copied ? (
              <>
                <Check className="size-4" /> Kopyalandı
              </>
            ) : (
              <>
                <Code className="size-4" /> Kodu kopyala
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

/** Weekly-monitoring opt-in for a domain. */
export function MonitorCard({
  domain,
  score,
}: {
  domain: string;
  score: number;
}) {
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [state, setState] = React.useState<
    "idle" | "saving" | "done" | "error"
  >("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === "saving") return;
    setState("saving");
    try {
      const res = await fetch("/api/health-report/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), domain, score }),
      });
      if (res.ok) {
        const data: { token?: string } = await res.json();
        setToken(data.token ?? null);
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  return (
    <section
      className="hr-no-print hr-in flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-6 sm:flex-row sm:items-center sm:justify-between"
      style={{ animationDelay: "220ms" }}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/10">
          <Bell className="hr-accent size-5" />
        </span>
        <div>
          <h3 className="font-bold tracking-tight">Bu siteyi haftalık izle</h3>
          <p className="mt-0.5 text-sm text-base-content/60">
            Skorun değişince e-posta ile haber verelim.
          </p>
        </div>
      </div>

      {state === "done" ? (
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-success">
            <Check className="size-4" /> Eklendi, skor değişince haber
            vereceğiz.
          </p>
          {token && (
            <a
              href={`/izleme/${token}`}
              className="hr-accent text-sm font-medium hover:underline"
            >
              İzleme panelini aç →
            </a>
          )}
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="flex w-full flex-col gap-1 sm:w-auto"
        >
          <div className="flex w-full gap-2 sm:w-auto">
            <input
              type="email"
              required
              aria-label="E-posta"
              placeholder="siz@example.com"
              className="hr-field w-full rounded-xl border border-base-300 px-3.5 py-2.5 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35 sm:w-56"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
            <button
              type="submit"
              className="hr-cta shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              disabled={state === "saving"}
            >
              {state === "saving" ? "..." : "İzle"}
            </button>
          </div>
          {state === "error" && (
            <p className="text-xs text-error">
              Bir hata oluştu, tekrar deneyin.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
