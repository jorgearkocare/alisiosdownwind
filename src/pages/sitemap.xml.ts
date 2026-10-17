// Mapa del sitio para Google y otros buscadores. Se genera solo al construir la web:
// incluye las portadas, el archivo del Report y cada número en los cuatro idiomas.
import type { APIRoute } from "astro";
import { site } from "../config";
import { locales } from "../i18n";
import { issues, reportPath } from "../report/issues";

const home = (lang: string) => (lang === "es" ? "/" : `/${lang}/`);

export const GET: APIRoute = () => {
  const base = site.url.replace(/\/$/, "");
  const groups: { paths: Record<string, string>; lastmod?: string; priority: string }[] = [
    { paths: Object.fromEntries(locales.map((l) => [l, home(l)])), priority: "1.0" },
    { paths: Object.fromEntries(locales.map((l) => [l, reportPath(l)])), lastmod: issues[0]?.date, priority: "0.7" },
    ...issues.map((issue) => ({
      paths: Object.fromEntries(locales.map((l) => [l, reportPath(l, issue.slug)])),
      lastmod: issue.date,
      priority: "0.6",
    })),
  ];

  const urls = groups.flatMap((g) =>
    Object.values(g.paths).map((path) => {
      const alternates = Object.entries(g.paths)
        .map(([l, p]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${base}${p}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${g.paths.es}"/>`)
        .join("\n");
      return [
        "  <url>",
        `    <loc>${base}${path}</loc>`,
        g.lastmod ? `    <lastmod>${g.lastmod}</lastmod>` : "",
        `    <priority>${g.priority}</priority>`,
        alternates,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    }),
  );

  const legal = ["/aviso-legal/", "/privacidad/"].map(
    (p) => `  <url>\n    <loc>${base}${p}</loc>\n    <priority>0.2</priority>\n  </url>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...urls, ...legal].join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
