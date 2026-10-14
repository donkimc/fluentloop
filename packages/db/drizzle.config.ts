import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config. DATABASE_URL must be set to generate or apply migrations.
 * Production applies migrations on deploy (or via `pnpm --filter @fluentloop/db migrate`).
 */
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/fluentloop",
  },
});
