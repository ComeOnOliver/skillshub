import "dotenv/config";
import { createDb } from "./client.js";

async function main() {
  const db = createDb();
  console.log("Database connection established.");
  console.log("Run `pnpm db:generate` then `pnpm db:migrate` via drizzle-kit.");
}

main().catch(console.error);
