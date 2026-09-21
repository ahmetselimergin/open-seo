# SEO Sağlık Raporu MVP

Yaklaşım A (onaylı): OpenSEO audit motorunun analiz katmanını yeniden kullanan hafif,
login gerektirmeyen, sıfır zorunlu API maliyetli akış. DataForSEO görünürlük YOK.
E-posta: sadece kabul et/logla.

## Yapılacaklar

- [x] `src/server/lib/audit/quick-audit.ts` — hafif orkestratör (discoverUrls + crawlPage
      + frontier BFS + runPageReporters + hafif çoklu-sayfa kontrolleri). Maks 50 sayfa,
      25sn zaman bütçesi, 6 eşzamanlı, SSRF korumalı.
- [x] `src/shared/health-report.ts` — özetleyici: skor (0–100), grade, top 3 problem,
      30 günlük plan. Saf/testli.
- [x] `src/shared/health-report-copy.ts` — sade Türkçe sorun kopyaları + plan haftaları
      (max-lines sınırı için logikadan ayrıldı).
- [x] `src/shared/health-report.test.ts` — 8 birim testi (skor, cap, sıralama, domain).
- [x] `src/types/schemas/health-report.ts` — zod girdi şeması (domain + opsiyonel email).
- [x] `src/routes/api/health-report.ts` — public POST endpoint.
- [x] `src/routes/health-report.tsx` — tek girişli public sayfa + 3 bölümlü Sağlık Karnesi.
- [x] Doğrulama: install, db:migrate:local, dev, badseo yerine canlı sitelere karşı test,
      tsc (0 hata), oxlint (0 hata), prettier (temiz), vitest (8/8).

## Review

Tümü Yaklaşım A ile tamamlandı. Yeni akış OpenSEO'nun gerçek analiz motorunu
(`discoverUrls`, `crawlPage`, `runPageReporters`, `audit-issues`, `url-policy` SSRF,
`url-utils`, `crawl-throttle`) yeniden kullanır; ağır orkestrasyon (Workflow/DO/D1/
auth/billing) hiç devreye girmez. Kesişen-sayfa kontrolleri (kırık iç link, kopya
başlık/açıklama) bellek içinde hafifçe yeniden yazıldı.

Uçtan uca doğrulama (lokal dev, http://localhost:3001):
- `example.com` → 200, skor 92 "Mükemmel", 1 sayfa, 2 sorun.
- `books.toscrape.com` → 200, 50 sayfa ~11sn (truncated), kopya-başlık tespiti çalıştı.
- SSRF: `http://localhost:8080` → 400 "engelli hedef"; geçersiz/boş girdi → 400.
- E-posta gönderilince log satırı düşüyor (mail gönderilmiyor — MVP kararı).

Kalite kapıları: `tsc --noEmit` 0 hata (proje geneli), `oxlint . --type-aware` 0 hata,
`prettier --check` temiz, `vitest` 8/8.

Notlar / sonraki adımlar (kapsam dışı, isteğe bağlı):
- Public endpoint şu an Turnstile/rate-limit binding'i kullanmıyor; canlı dağıtımdan
  önce `web/` free-tools'taki kötüye kullanım korumasının benzeri eklenebilir.
- DataForSEO "temel görünürlük" ve Lighthouse performans skoru sonradan eklenebilir.
- E-posta gönderimi (Loops) ileride bağlanabilir.
