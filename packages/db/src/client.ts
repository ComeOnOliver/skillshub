import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

let pool: pg.Pool | null = null;

export function createDb(databaseUrl?: string) {
  const url = databaseUrl ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!pool) {
    pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  }
  return drizzle(pool, { schema });
}

export type Database = ReturnType<typeof createDb>;
