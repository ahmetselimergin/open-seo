/** Cinematic dark theme + motion for the mySeo homepage, scoped to `.hr-root`
 * so it never depends on the system theme and never affects the app dashboard.
 * One electric-blue accent, layered near-black surfaces, restrained glow. */

export function PageStyles() {
  return (
    <style>{`
      .hr-root{
        color-scheme: dark;
        /* Art-directed dark palette: DaisyUI tokens overridden for this subtree */
        --color-base-100: #0e1219;   /* card / raised surface */
        --color-base-200: #070a0f;   /* page background (deepest) */
        --color-base-300: #232a36;   /* borders, tracks */
        --color-base-content: #eef2f8;
        --color-secondary: #35c6f4;
        --color-secondary-content: #04121b;
        /* Electric blue / cyan accent */
        --hr-accent: #35c6f4;
        --hr-accent-2: #3b82f6;
        --hr-accent-content: #04121b;
        --hr-glow: color-mix(in oklab, var(--hr-accent) 40%, transparent);
      }
      .hr-accent{ color: var(--hr-accent); }

      .hr-cta{
        background: linear-gradient(135deg, var(--hr-accent-2), var(--hr-accent));
        color: var(--hr-accent-content);
        box-shadow: 0 10px 34px -10px color-mix(in oklab, var(--hr-accent) 75%, transparent);
        transition: transform .18s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, filter .2s ease;
      }
      .hr-cta:hover{ filter: brightness(1.08); box-shadow: 0 14px 46px -10px color-mix(in oklab, var(--hr-accent) 90%, transparent); }
      .hr-cta:active{ transform: scale(.97); }
      .hr-cta:focus-visible{ outline: 2px solid var(--hr-accent); outline-offset: 3px; }
      .hr-field{ background: color-mix(in oklab, var(--color-base-100) 92%, black); }
      .hr-field:focus-within{ border-color: var(--hr-accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--hr-accent) 22%, transparent); }

      /* Translucent dark nav; content scrolls under it */
      .hr-nav{
        background: color-mix(in oklab, var(--color-base-200) 62%, transparent);
        backdrop-filter: saturate(160%) blur(18px);
        -webkit-backdrop-filter: saturate(160%) blur(18px);
        border-bottom: 1px solid color-mix(in oklab, var(--color-base-content) 8%, transparent);
      }

      /* Accent spotlight behind the hero product shot */
      .hr-spotlight{ position: relative; isolation: isolate; }
      .hr-spotlight::before{
        content:""; position:absolute; left:50%; top:42%; width:130%; aspect-ratio:1;
        transform: translate(-50%,-50%); z-index:-1; pointer-events:none;
        background: radial-gradient(closest-side, var(--hr-glow), transparent 72%);
        filter: blur(30px);
      }
      /* Faint top glow for the whole hero */
      .hr-aura{ position: relative; }
      .hr-aura::before{
        content:""; position:absolute; inset:-10% -20% auto -20%; height:60vh; z-index:-1; pointer-events:none;
        background: radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--hr-accent) 14%, transparent), transparent 70%);
      }

      /* Atmospheric faint grid that fades out toward the edges */
      .hr-grid{
        background-image:
          linear-gradient(color-mix(in oklab, var(--color-base-content) 6%, transparent) 1px, transparent 1px),
          linear-gradient(90deg, color-mix(in oklab, var(--color-base-content) 6%, transparent) 1px, transparent 1px);
        background-size: 54px 54px;
        -webkit-mask-image: radial-gradient(ellipse 95% 65% at 60% 0%, #000 28%, transparent 76%);
        mask-image: radial-gradient(ellipse 95% 65% at 60% 0%, #000 28%, transparent 76%);
      }

      /* Floating status chips around the hero product shot */
      .hr-chip{
        background: color-mix(in oklab, var(--color-base-100) 86%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid color-mix(in oklab, var(--color-base-content) 12%, transparent);
        box-shadow: 0 16px 40px -18px rgba(0,0,0,.75);
      }
      .hr-chip-a{ animation: hr-chip-a 6s ease-in-out infinite; }
      .hr-chip-b{ animation: hr-chip-b 7s ease-in-out infinite; }
      @keyframes hr-chip-a{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      @keyframes hr-chip-b{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }

      /* Subtle 3D product tilt that straightens on hover (desktop only) */
      .hr-tilt{ transition: transform .6s cubic-bezier(.16,1,.3,1); transform-style: preserve-3d; }
      @media (min-width: 1024px){
        .hr-tilt{ transform: perspective(1500px) rotateY(-9deg) rotateX(5deg) rotateZ(-1deg); }
        .hr-tilt:hover{ transform: perspective(1500px) rotateY(0) rotateX(0) rotateZ(0); }
      }

      /* Window chrome (mac-style traffic lights + address pill) */
      .hr-dot{ width:.72rem; height:.72rem; border-radius:9999px; background: color-mix(in oklab, var(--color-base-content) 16%, transparent); }

      /* Card surface subtle inner highlight for depth */
      .hr-surface{
        background: var(--color-base-100);
        border: 1px solid color-mix(in oklab, var(--color-base-content) 9%, transparent);
        box-shadow: inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 6%, transparent),
                    0 24px 70px -40px rgba(0,0,0,.8);
      }

      .hr-in{ opacity: 0; animation: hr-in .7s cubic-bezier(.16,1,.3,1) forwards; }
      @keyframes hr-in{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      .hr-fade{ animation: hr-fade .45s ease; }
      @keyframes hr-fade{ from{opacity:0} to{opacity:1} }
      .hr-gauge-arc{ animation: hr-arc 1.2s cubic-bezier(.16,1,.3,1) forwards; }
      @keyframes hr-arc{ from{stroke-dashoffset:326.72} }
      .hr-float{ animation: hr-float 7s ease-in-out infinite; }
      @keyframes hr-float{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

      @media (prefers-reduced-motion: no-preference){
        @supports (animation-timeline: view()){
          .hr-reveal{ animation: hr-reveal linear both; animation-timeline: view(); animation-range: entry 5% cover 26%; }
        }
      }
      @keyframes hr-reveal{ from{ opacity:0; transform: translateY(48px) scale(.985);} to{ opacity:1; transform:none;} }

      .hr-shimmer{ position:relative; overflow:hidden; }
      .hr-shimmer::after{
        content:""; position:absolute; inset:0;
        background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-base-content) 8%, transparent), transparent);
        transform: translateX(-100%); animation: hr-shim 1.5s ease-in-out infinite;
      }
      @keyframes hr-shim{ to{ transform: translateX(100%); } }

      @media (prefers-reduced-motion: reduce){
        .hr-in,.hr-fade,.hr-gauge-arc,.hr-float,.hr-chip-a,.hr-chip-b,.hr-shimmer::after{ animation: none !important; }
        .hr-in{ opacity:1; transform:none; }
        .hr-tilt{ transform: none !important; }
      }

      /* Print / Save-as-PDF: a clean, ink-friendly light layout of the report */
      @media print{
        .hr-root{
          height:auto !important; overflow:visible !important;
          color-scheme: light;
          --color-base-100:#ffffff; --color-base-200:#ffffff;
          --color-base-300:#e5e7eb; --color-base-content:#111418;
          background:#fff !important; color:#111 !important;
        }
        .hr-no-print{ display:none !important; }
        .hr-surface, .hr-chip{ box-shadow:none !important; background:#fff !important; border:1px solid #e5e7eb !important; }
        .hr-cta{ background:#111 !important; color:#fff !important; box-shadow:none !important; }
        .hr-in, .hr-reveal, .hr-tilt, .hr-float{ opacity:1 !important; transform:none !important; animation:none !important; }
        main{ padding-top:0 !important; max-width:none !important; }
        section, article{ break-inside: avoid; }
        *{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `}</style>
  );
}

/** Fixed atmospheric background: faint grid + accent glows. Purely decorative. */
export function Backdrop() {
  return (
    <div
      aria-hidden
      className="hr-no-print pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="hr-grid absolute inset-0" />
      <div
        className="absolute -right-40 -top-48 size-[44rem] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--hr-accent) 22%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute -left-52 top-1/3 size-[34rem] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--hr-accent-2) 16%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}

/** Loading placeholder shaped like the real scorecard, not a spinner. */
export function ScorecardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="hr-surface flex flex-col items-center gap-6 rounded-3xl p-8 sm:flex-row sm:gap-8">
        <div className="hr-shimmer size-32 shrink-0 rounded-full bg-base-300/40" />
        <div className="flex w-full flex-col gap-3">
          <div className="hr-shimmer h-6 w-48 rounded-md bg-base-300/40" />
          <div className="hr-shimmer h-4 w-full max-w-sm rounded bg-base-300/40" />
          <div className="hr-shimmer h-4 w-32 rounded bg-base-300/40" />
          <div className="mt-1 flex gap-2">
            <div className="hr-shimmer h-6 w-16 rounded-full bg-base-300/40" />
            <div className="hr-shimmer h-6 w-16 rounded-full bg-base-300/40" />
            <div className="hr-shimmer h-6 w-16 rounded-full bg-base-300/40" />
          </div>
        </div>
      </div>
      <div className="hr-shimmer h-24 rounded-3xl border border-base-300 bg-base-100" />
      <div className="hr-shimmer h-24 rounded-3xl border border-base-300 bg-base-100" />
    </div>
  );
}
