import { PageStyles } from "@/client/features/health-report/visuals";

export interface LegalSection {
  heading: string;
  body: string[];
}

/** Shared shell for mySeo legal pages (privacy, terms), in the site theme. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="hr-root h-dvh overflow-y-auto bg-base-200 text-base-content">
      <PageStyles />

      <header className="hr-nav sticky top-0 z-20">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-5">
          <a href="/" className="text-lg font-bold tracking-tight">
            my<span className="hr-accent">Seo</span>
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-base-content/45">
          Son güncelleme: {updated}
        </p>
        <p className="mt-6 leading-relaxed text-base-content/70">{intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {sections.map((section) => (
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
          Sorularınız için:{" "}
          <a className="hr-accent" href="mailto:iletisim@mySeo.com">
            iletisim@mySeo.com
          </a>
        </p>
      </main>
    </div>
  );
}
