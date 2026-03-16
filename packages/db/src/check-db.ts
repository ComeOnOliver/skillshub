import "dotenv/config";
import pg from "pg";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
  console.log("USERS columns:", res.rows.map((r: any) => r.column_name));
  
  const res2 = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log("TABLES:", res2.rows.map((r: any) => r.table_name));
  
  const res3 = await pool.query("SELECT count(*) as c FROM users");
  console.log("Users:", res3.rows[0].c);
  const res4 = await pool.query("SELECT count(*) as c FROM repos");
  console.log("Repos:", res4.rows[0].c);
  const res5 = await pool.query("SELECT count(*) as c FROM skills");
  console.log("Skills:", res5.rows[0].c);
  
  await pool.end();
  process.exit(0);
}
main();
