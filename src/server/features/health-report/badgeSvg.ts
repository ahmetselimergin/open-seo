// Embeddable SVG score badge. Served as image/svg+xml so site owners can drop
// it into their page with a plain <img>, linking back to mySeo. No user content
// is rendered (score only), so there is nothing to escape.

function toneColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export function renderBadgeSvg(score: number | null): string {
  const value = score === null ? "—" : String(score);
  const color = score === null ? "#8b95a3" : toneColor(score);
  const font =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="212" height="56" viewBox="0 0 212 56" role="img" aria-label="mySeo SEO skoru ${value}">
  <rect x="0.5" y="0.5" width="211" height="55" rx="13" fill="#0e1219" stroke="#232a36"/>
  <text x="16" y="24" font-family="${font}" font-size="15" font-weight="700" letter-spacing="-0.3">
    <tspan fill="#eef2f8">my</tspan><tspan fill="#35c6f4">Seo</tspan>
  </text>
  <text x="16" y="41" font-family="${font}" font-size="9" font-weight="600" letter-spacing="1.4" fill="#8b95a3">SEO SKORU</text>
  <line x1="140" y1="14" x2="140" y2="42" stroke="#232a36"/>
  <text x="196" y="30" text-anchor="end" font-family="${font}" font-size="26" font-weight="800" fill="${color}">${value}</text>
  <text x="196" y="44" text-anchor="end" font-family="${font}" font-size="10" font-weight="600" fill="#8b95a3">/100</text>
</svg>`;
}
