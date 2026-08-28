import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";
import react from "@astrojs/react";
import emdash from "emdash/astro";
import { sqlite, libsql } from "emdash/db";
import { createStorage as local } from "emdash/storage/local";
import { createStorage as s3 } from "emdash/storage/s3";
import { dashcommerce } from "@dashcommerce/core";

const isCloudflare = process.env.DEPLOY_TARGET === "cloudflare";

export default defineConfig({
  output: "server",
  adapter: isCloudflare ? cloudflare() : node({ mode: "standalone" }),
  server: {
    port: 4321,
    host: true,
  },
  integrations: [
    react(),
    emdash({
      database: isCloudflare && process.env.TURSO_DATABASE_URL
        ? libsql({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
          })
        : sqlite({ url: "file:./data.db" }),
      storage: isCloudflare && process.env.R2_BUCKET_NAME
        ? s3({
            bucket: process.env.R2_BUCKET_NAME,
            endpoint: process.env.R2_ENDPOINT,
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            publicUrl: process.env.R2_PUBLIC_URL,
          })
        : local({ directory: "./uploads", baseUrl: "/_emdash/api/media/file" }),
      plugins: [dashcommerce()],
    }),
  ],
});
