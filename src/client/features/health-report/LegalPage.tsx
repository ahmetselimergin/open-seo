import { PageStyles } from "@/client/features/health-report/visuals";
import {
  LanguageSwitcher,
  LangProvider,
  useLang,
  type Lang,
} from "@/client/features/health-report/i18n";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const CHROME: Record<Lang, { updatedLabel: string; questions: string }> = {
  tr: { updatedLabel: "Son güncelleme:", questions: "Sorularınız için:" },
  en: { updatedLabel: "Last updated:", questions: "For questions:" },
};

/** Shared shell for mySeo legal pages (privacy, terms), bilingual + in theme. */
export function LegalPage({ tr, en }: { tr: LegalContent; en: LegalContent }) {
  return (
    <LangProvider>
      <LegalInner tr={tr} en={en} />
    </LangProvider>
  );
}

function LegalInner({ tr, en }: { tr: LegalContent; en: LegalContent }) {
  const { lang } = useLang();
  const c = lang === "en" ? en : tr;
  const chrome = CHROME[lang];

  return (
    <div className="hr-root h-dvh overflow-y-auto bg-base-200 text-base-content">
      <PageStyles />

      <header className="hr-nav sticky top-0 z-20">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <a href="/" className="text-lg font-bold tracking-tight">
            my<span className="hr-accent">Seo</span>
          </a>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-2 text-sm text-base-content/45">
          {chrome.updatedLabel} {c.updated}
        </p>
        <p className="mt-6 leading-relaxed text-base-content/70">{c.intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {c.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              {section.body.map((paragraph, i) => (
                <p
                  key={`${section.heading}-${i}`}
                  className="mt-2 leading-relaxed text-base-content/70"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-base-300 pt-6 text-sm text-base-content/50">
          {chrome.questions}{" "}
          <a className="hr-accent" href="mailto:iletisim@mySeo.com">
            iletisim@mySeo.com
          </a>
        </p>
      </main>
    </div>
  );
}
