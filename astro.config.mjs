// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { d1, r2 } from "@emdash-cms/cloudflare";
import emdash from "emdash/astro";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(), // Required — the admin UI is a React app
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});