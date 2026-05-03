#!/usr/bin/env node
/**
 * INV-16: Apply call_logs Realtime migration (RLS + publication) via Postgres.
 *
 * Requires a direct Postgres URL (not the Supabase anon key):
 *   Supabase Dashboard → Project Settings → Database → Connection string (URI)
 *
 * Usage:
 *   cd backend && npm run migrate:call-logs-realtime
 *
 * Env (backend/.env):
 *   SUPABASE_DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   or DATABASE_URL=...
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const databaseUrl =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "";

async function main() {
  if (!databaseUrl) {
    console.error(
      "[INV-16] No SUPABASE_DATABASE_URL or DATABASE_URL in backend/.env.\n" +
        "Copy the Postgres connection URI from Supabase → Settings → Database."
    );
    process.exit(1);
  }

  const migrationsDir = path.resolve(__dirname, "../migrations");
  const files = [
    "20260503_call_logs_realtime_rls.sql",
    "20260503_call_logs_realtime_publication.sql",
  ];

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, "utf8");
      console.log(`[INV-16] Applying ${file}…`);
      await client.query(sql);
    }
    console.log("[INV-16] Migrations applied successfully.");
    console.log(
      "[INV-16] Verify: Dashboard → Database → Replication → confirm call_logs is listed.\n" +
        "[INV-16] Smoke test: insert a call_logs row for your tenant and watch Overview/Analytics refresh."
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[INV-16] Failed:", err.message);
  process.exit(1);
});
