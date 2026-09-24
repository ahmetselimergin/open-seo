import * as React from "react";
import { Backdrop, PageStyles } from "@/client/features/health-report/visuals";
import {
  LanguageSwitcher,
  LangProvider,
  useLang,
} from "@/client/features/health-report/i18n";
import { toolsCopy } from "@/client/features/health-report/i18n-tools";

const TITLE_MAX = 60;
const DESC_MAX = 160;

function meter(len: number, min: number, max: number): string {
  if (len === 0 || len > max) return "text-error";
  if (len < min) return "text-warning";
  return "text-success";
}
function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export function SnippetToolPage() {
  return (
    <LangProvider>
      <SnippetInner />
    </LangProvider>
  );
}

function SnippetInner() {
  const t = toolsCopy(useLang().lang);
  const c = t.snippet;
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [url, setUrl] = React.useState("");

  const previewTitle = title.trim() || c.previewTitle;
  const previewDesc = desc.trim() || c.previewDesc;
  const previewUrl = url.trim() || c.previewUrl;

  return (
    <div className="hr-root relative h-dvh overflow-y-auto bg-base-200 text-base-content">
      <PageStyles />
      <Backdrop />
      <header className="hr-nav sticky top-0 z-20">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <a href="/" className="text-lg font-bold tracking-tight">
            my<span className="hr-accent">Seo</span>
          </a>
          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <a href="/araclar" className="hover:text-base-content">
              {t.allTools}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10">
        <div className="text-center">
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            {c.title} <span className="hr-accent">{c.accent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base-content/60">
            {c.subtitle}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          <Field
            label={c.fTitle}
            len={title.length}
            max={TITLE_MAX}
            min={30}
            unit={c.chars}
          >
            <input
              type="text"
              className="hr-field w-full rounded-2xl border border-base-300 px-4 py-3 outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35"
              placeholder={c.phTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field
            label={c.fDesc}
            len={desc.length}
            max={DESC_MAX}
            min={70}
            unit={c.chars}
          >
            <textarea
              rows={3}
              className="hr-field w-full resize-none rounded-2xl border border-base-300 px-4 py-3 outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35"
              placeholder={c.phDesc}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </Field>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{c.fUrl}</span>
            <input
              type="text"
              className="hr-field w-full rounded-2xl border border-base-300 px-4 py-3 outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35"
              placeholder={c.phUrl}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
        </div>

        <section className="hr-surface mt-8 rounded-3xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-base-content/50">
            {c.googlePreview}
          </h2>
          <p className="text-xs text-base-content/50">{previewUrl}</p>
          <p className="mt-1 text-lg text-[#8ab4f8]">
            {truncate(previewTitle, TITLE_MAX)}
          </p>
          <p className="mt-1 text-sm text-base-content/60">
            {truncate(previewDesc, DESC_MAX)}
          </p>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  len,
  min,
  max,
  unit,
  children,
}: {
  label: string;
  len: number;
  min: number;
  max: number;
  unit: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs font-medium ${meter(len, min, max)}`}>
          {len} / {max} {unit}
        </span>
      </div>
      {children}
    </div>
  );
}
