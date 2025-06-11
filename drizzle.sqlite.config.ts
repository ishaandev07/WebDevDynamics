import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations-sqlite",
  schema: "./shared/schema-clean.sqlite.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./database.sqlite",
  },
});