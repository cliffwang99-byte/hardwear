import type { APIRoute } from "astro";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 仅收录手写的 Astro 静态页面（不含 categories / series / topics / wholesale-oem 等动态或已剔除路由）。
const STATIC_PATHS: Record<string, number> = {
  "/": 1,
  "/products": 0.9,
  "/about-us": 0.6,
  "/contact": 0.6,
  "/faq": 0.5,
  "/blog": 0.7,
  "/cart": 0.4,
  "/wishlist": 0.4,
  "/oem-odm": 0.7,
  "/markets-solutions": 0.8,
  "/privacy": 0.3,
  "/terms": 0.3,
  "/how-to-order": 0.7,
};

export const GET: APIRoute = async ({ request }) => {
  const base = new URL(request.url).origin.replace(/\/+$/, "");

  // 每种语种各输出一份条目（en 无前缀，es/ar 带前缀）
  const locales = ["", "/es", "/ar"] as const;

  const entries = locales.flatMap((locale) =>
    Object.entries(STATIC_PATHS).map(([path, priority]) => ({
      loc: esc(base + locale + path),
      priority: String(priority),
    })),
  );

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (e) => `  <url><loc>${e.loc}</loc><priority>${e.priority}</priority></url>`,
    ),
    "</urlset>",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};