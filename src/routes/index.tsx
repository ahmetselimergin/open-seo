import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/client/features/health-report/HomePage";
import { getHomeMeta } from "@/serverFunctions/homeMeta";

const META = {
  tr: {
    title: "mySeo — Ücretsiz SEO Sağlık Raporu",
    description:
      "Alan adınızı girin, sitenizin ücretsiz SEO sağlık karnesini ve 30 günlük eylem planınızı saniyeler içinde alın. Kayıt gerekmez.",
  },
  en: {
    title: "mySeo — Free SEO Health Report",
    description:
      "Enter your domain and get your site's free SEO health scorecard and a 30-day action plan in seconds. No sign-up required.",
  },
} as const;

export const Route = createFileRoute("/")({
  loader: () => getHomeMeta(),
  head: ({ loaderData }) => {
    const lang = loaderData?.lang ?? "tr";
    const origin = loaderData?.origin ?? "";
    const c = META[lang];
    const canonical = `${origin}/`;
    const ogImage = `${origin}/og.png`;
    return {
      meta: [
        { title: c.title },
        { name: "description", content: c.description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "mySeo" },
        { property: "og:locale", content: lang === "en" ? "en_US" : "tr_TR" },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: c.title },
        { name: "twitter:description", content: c.description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: HomePage,
});
