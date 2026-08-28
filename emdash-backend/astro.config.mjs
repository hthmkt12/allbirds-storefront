import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";
import react from "@astrojs/react";
import emdash from "emdash/astro";
import { sqlite } from "emdash/db";
import { d1 } from "@emdash-cms/cloudflare";
import { createStorage as local } from "emdash/storage/local";
import { dashcommerce } from "@dashcommerce/core";

const isCloudflare = process.env.DEPLOY_TARGET === "cloudflare";

export default defineConfig({
  output: "server",
  adapter: isCloudflare
    ? cloudflare()
    : node({ mode: "standalone" }),
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    build: {
      minify: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/kysely")) {
              return "vendor-kysely";
            }
          },
        },
      },
    },
  },
  integrations: [
    react(),
    emdash({
      database: isCloudflare
        ? d1({ binding: "DB" })
        : sqlite({ url: "file:./data.db" }),
      storage: local({ directory: "./uploads", baseUrl: "/_emdash/api/media/file" }),
      plugins: [dashcommerce()],
    }),
  ],
});
