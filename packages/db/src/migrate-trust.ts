import "dotenv/config";
import pg from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Running trust score migration...");

  // Add new columns to skills table
  await client.query(`
    ALTER TABLE skills ADD COLUMN IF NOT EXISTS trust_score NUMERIC(5,2) NOT NULL DEFAULT 0;
    ALTER TABLE skills ADD COLUMN IF NOT EXISTS fetch_count INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE skills ADD COLUMN IF NOT EXISTS helpful_rate NUMERIC(4,3);
    ALTER TABLE skills ADD COLUMN IF NOT EXISTS feedback_count INTEGER NOT NULL DEFAULT 0;
  `);
  console.log("  ✓ skills columns added");

  // Add reputation column to users table
  await client.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation INTEGER NOT NULL DEFAULT 0;
  `);
  console.log("  ✓ users.reputation column added");

  // Create skill_events table
  await client.query(`
    CREATE TABLE IF NOT EXISTS skill_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type TEXT NOT NULL,
      skill_id UUID REFERENCES skills(id),
      agent_id UUID REFERENCES users(id),
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS skill_events_skill_id_idx ON skill_events(skill_id);
    CREATE INDEX IF NOT EXISTS skill_events_type_idx ON skill_events(event_type);
    CREATE INDEX IF NOT EXISTS skill_events_created_idx ON skill_events(created_at);
  `);
  console.log("  ✓ skill_events table created");

  // Create skill_feedback table
  await client.query(`
    CREATE TABLE IF NOT EXISTS skill_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      skill_id UUID NOT NULL REFERENCES skills(id),
      agent_id UUID NOT NULL REFERENCES users(id),
      task TEXT NOT NULL,
      helpful BOOLEAN NOT NULL,
      context TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS skill_feedback_skill_id_idx ON skill_feedback(skill_id);
    CREATE INDEX IF NOT EXISTS skill_feedback_agent_id_idx ON skill_feedback(agent_id);
    CREATE UNIQUE INDEX IF NOT EXISTS skill_feedback_daily_idx ON skill_feedback(skill_id, agent_id, CAST(created_at AT TIME ZONE 'UTC' AS date));
  `);
  console.log("  ✓ skill_feedback table created");

  // TODO: Add a cleanup cron job to prune old skill_events rows (e.g. older than 90 days)
  console.log("Migration complete.");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
