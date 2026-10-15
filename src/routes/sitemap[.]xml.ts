import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const escapeXml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { publicSiteOrigin } = await import("../server/seo");
        const { editorialPosts } = await import("../server/editorial");
        const origin = await publicSiteOrigin();
        if (!origin)
          return new Response("Public origin has not been configured.", {
            status: 503,
            headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
          });
        const pages = [
          "/",
          "/shop",
          "/services",
          "/quote",
          "/about",
          "/contact",
          "/blog",
          "/privacy-policy",
          "/terms-of-service",
          "/cookie-policy",
          "/community-guidelines",
          "/copyright-policy",
          "/facebook-data-deletion",
          ...(await editorialPosts()).map((post) => `/blog/${encodeURIComponent(post.slug)}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `<url><loc>${escapeXml(`${origin}${page}`)}</loc></url>`).join("\n")}\n</urlset>`;
        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
