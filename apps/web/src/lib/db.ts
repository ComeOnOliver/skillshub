import { createDb } from "@skillshub/db/client";

let db: ReturnType<typeof createDb>;

export function getDb() {
  if (!db) {
    db = createDb();
  }
  return db;
}
