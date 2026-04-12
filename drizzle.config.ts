import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnv({ path: ".env.local", override: false });
loadEnv({ path: ".env", override: false });

const fallbackUrl = "postgres://postgres:postgres@127.0.0.1:5432/noema_forge";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL_NON_POOLING ??
      process.env.DATABASE_URL ??
      fallbackUrl,
  },
  strict: true,
  verbose: true,
});
