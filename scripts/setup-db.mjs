// Applies supabase/schema.sql to the database in DATABASE_URL.
import { readFile } from "node:fs/promises";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const sql = await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query("select raised, shirts_sold, designs, days_left from public.fund_stats");
  console.log("Schema applied. Fund stats:", rows[0]);
} finally {
  await client.end();
}
