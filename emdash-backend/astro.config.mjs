import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import emdash from "emdash/astro";
import { sqlite } from "emdash/db";
import { createStorage as local } from "emdash/storage/local";
import { dashcommerce } from "@dashcommerce/core";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  server: {
    port: 4321,
    host: true
  },
  integrations: [
    react(),
    emdash({
      database: sqlite({ url: "file:./data.db" }),
      storage: local({ directory: "./uploads", baseUrl: "/_emdash/api/media/file" }),
      plugins: [dashcommerce()],
    }),
  ],
});
