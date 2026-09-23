import type { AccountReport } from "@/server/features/health-report/account-store";

// Server-rendered account pages (login + dashboard) in the mySeo dark theme.
// No client JS: plain HTML forms drive the passwordless flow.

function esc(v: unknown): string {
  return String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] ?? c,
  );
}

const accent = "#35c6f4";

function shell(origin: string, title: string, inner: string): string {
  return `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} — mySeo</title>
<meta name="robots" content="noindex"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#070a0f;color:#eef2f8;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:${accent};text-decoration:none}
  .wrap{max-width:720px;margin:0 auto;padding:20px 20px 90px}
  header{display:flex;align-items:center;justify-content:space-between;height:56px}
  .brand{font-weight:800;font-size:18px;letter-spacing:-.02em;color:#eef2f8}
  .brand span{color:${accent}}
  h1{font-size:clamp(1.8rem,4vw,2.6rem);letter-spacing:-.02em;margin-top:20px}
  .lead{color:#c3cbd6;margin-top:10px}
  .card{background:#0e1219;border:1px solid #232a36;border-radius:16px;padding:18px;margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .card .meta{color:#8b95a3;font-size:.9rem}
  input{width:100%;background:#0a0d13;border:1px solid #232a36;border-radius:12px;padding:12px 14px;color:#eef2f8;font-size:1rem;outline:none}
  input:focus{border-color:${accent}}
  .btn{display:inline-block;background:linear-gradient(135deg,#3b82f6,${accent});color:#04121b;font-weight:600;border:0;border-radius:12px;padding:12px 20px;cursor:pointer;font-size:1rem}
  .row{display:flex;gap:8px;margin-top:16px}
  .muted{color:#8b95a3;font-size:.9rem;margin-top:10px}
  .sec{margin-top:36px}
  .sec h2{font-size:1.2rem;letter-spacing:-.01em}
  .empty{color:#8b95a3;margin-top:8px}
  .score{font-weight:800;font-size:1.1rem}
  .logout{background:none;border:1px solid #232a36;color:#c3cbd6;border-radius:10px;padding:8px 14px;cursor:pointer}
</style></head>
<body><div class="wrap">
<header>
  <a class="brand" href="${origin}/">my<span>Seo</span></a>
  <a href="${origin}/">Yeni tarama →</a>
</header>
${inner}
</div></body></html>`;
}

export function renderLoginPage(
  origin: string,
  opts: { sent?: boolean; error?: string } = {},
): string {
  const inner = opts.sent
    ? `<h1>E-postanı kontrol et</h1>
       <p class="lead">Giriş bağlantısını e-posta adresine gönderdik. Bağlantı 15 dakika geçerlidir.</p>
       <p class="muted"><a href="${origin}/hesap">Geri dön</a></p>`
    : `<h1>Hesabım</h1>
       <p class="lead">E-posta adresini gir; sana parolasız bir giriş bağlantısı gönderelim. Raporların ve izlemelerin tek yerde.</p>
       ${opts.error ? `<p style="color:#ef4444;margin-top:10px">${esc(opts.error)}</p>` : ""}
       <form class="row" method="POST" action="${origin}/api/account/login">
         <input type="email" name="email" placeholder="siz@example.com" required aria-label="E-posta"/>
         <button class="btn" type="submit">Giriş linki gönder</button>
       </form>
       <p class="muted">Parola yok. Sadece e-postana gelen bağlantıya tıkla.</p>`;
  return shell(origin, "Hesabım", inner);
}

export function renderDashboard(
  origin: string,
  reports: AccountReport[],
  monitors: { domain: string; lastScore: number | null; unsubToken: string }[],
): string {
  const reportRows =
    reports.length === 0
      ? `<p class="empty">Henüz kayıtlı rapor yok. <a href="${origin}/">İlk taramanı yap →</a></p>`
      : reports
          .map(
            (r) => `<div class="card">
              <div><div>${esc(r.domain)}</div><div class="meta">${esc(fmt(r.createdAt))}</div></div>
              <div style="display:flex;align-items:center;gap:14px">
                <span class="score">${r.score}</span>
                <a href="${origin}/report/${esc(r.id)}">Aç →</a>
              </div>
            </div>`,
          )
          .join("");

  const monitorRows =
    monitors.length === 0
      ? `<p class="empty">Haftalık izlemede site yok.</p>`
      : monitors
          .map(
            (m) => `<div class="card">
              <div>${esc(m.domain)}</div>
              <div style="display:flex;align-items:center;gap:14px">
                <span class="score">${m.lastScore ?? "—"}</span>
                <a href="${origin}/izleme/${esc(m.unsubToken)}">Panel →</a>
              </div>
            </div>`,
          )
          .join("");

  const inner = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px">
      <h1 style="margin:0">Hesabım</h1>
      <form method="POST" action="${origin}/api/account/logout">
        <button class="logout" type="submit">Çıkış</button>
      </form>
    </div>
    <div class="sec"><h2>Kayıtlı raporlar</h2>${reportRows}</div>
    <div class="sec"><h2>Haftalık izlemeler</h2>${monitorRows}</div>`;
  return shell(origin, "Hesabım", inner);
}

function fmt(iso: string): string {
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
