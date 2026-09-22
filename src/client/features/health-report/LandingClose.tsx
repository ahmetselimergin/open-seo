import { ArrowUp, ShieldCheck } from "lucide-react";

/** Cinematic dark CTA band + FAQ + footer (the close of the landing page). */
export function LandingClose() {
  return (
    <>
      <DarkCta />
      <Faq />
      <SiteFooter />
    </>
  );
}

// Cinematic close: an elevated panel lit by a single accent glow.
function DarkCta() {
  return (
    <section className="hr-surface hr-reveal relative overflow-hidden rounded-[2rem] px-6 py-20 text-center sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 80% at 50% 0%, color-mix(in oklab, var(--hr-accent) 22%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <h2 className="mx-auto max-w-2xl text-[clamp(2rem,5.5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-balance">
          Sitenizi bugün kontrol edin.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-base-content/60">
          Ücretsiz, kayıt gerektirmez ve saniyeler sürer.
        </p>
        <a
          href="#hr-start"
          className="hr-cta mt-8 inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-lg font-semibold"
        >
          Ücretsiz taramaya başla
          <ArrowUp className="size-5" />
        </a>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Gerçekten ücretsiz mi?",
    a: "Evet. Alan adını girip raporu almak tamamen ücretsizdir ve kart bilgisi istemez.",
  },
  {
    q: "Kayıt olmam gerekiyor mu?",
    a: "Hayır. Hesap açmadan doğrudan raporu alırsınız. E-posta alanı tamamen opsiyoneldir.",
  },
  {
    q: "Verilerimi saklıyor musunuz?",
    a: "Rapor için yalnızca sitenin herkese açık sayfaları taranır. E-posta verirseniz sadece raporunuzu iletmek için kullanılır.",
  },
  {
    q: "Kaç sayfa taranıyor ve ne kadar sürüyor?",
    a: "Gereksiz maliyeti önlemek için en fazla 50 sayfa taranır. Çoğu sitede rapor 30 saniyede hazır olur.",
  },
];

function Faq() {
  return (
    <section className="hr-reveal mx-auto w-full max-w-3xl">
      <h2 className="text-center text-[clamp(1.8rem,4.5vw,3rem)] font-semibold tracking-[-0.02em]">
        Sık sorulan sorular
      </h2>
      <div className="mt-10 flex flex-col divide-y divide-base-300 border-y border-base-300">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
              {q}
              <span className="hr-accent shrink-0 text-2xl leading-none transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl leading-relaxed text-base-content/65">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="flex flex-col gap-4 border-t border-base-300 pt-10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xl font-bold tracking-tight">
          my<span className="hr-accent">Seo</span>
        </p>
        <p className="mt-1 text-sm text-base-content/50">
          Sitenizin SEO sağlığı, herkesin anlayacağı dilde.
        </p>
      </div>
      <p className="inline-flex items-center gap-1.5 text-sm text-base-content/45">
        <ShieldCheck className="size-4" />
        Ücretsiz, kayıt gerektirmez
      </p>
    </footer>
  );
}
