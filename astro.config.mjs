// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { d1, r2 } from "@emdash-cms/cloudflare";
import emdash from "emdash/astro";
import { translatorDescriptor } from "./translator/index.ts";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "ar"],
    // fallback: 缺 es/ar 翻译时回退英文
    fallback: { es: "en", ar: "en" },
    // rewrite: 回退时直接渲染英文内容但保留 /es、/ar 路径（不 302 跳回英文）
    // 这样 Astro.currentLocale 才能保持为 es/ar，内部链接才会正确加语种前缀
    routing: {
      fallbackType: "rewrite",
    },
    // 注意：不要启用 routing.prefixDefaultLocale，否则 /_emdash/admin 会 404
  },
  image: {
    // 不绑定具体域名：只按路径授权 EmDash 媒体路由，
    // 这样无论部署在 workers.dev 还是自定义域名下都能被 Astro 图片服务优化。
    remotePatterns: [{ pathname: "/_emdash/api/media/file/**" }],
  },
  integrations: [
    react(), // Required — the admin UI is a React app
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      plugins: [translatorDescriptor()],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});