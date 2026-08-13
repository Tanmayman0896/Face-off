import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🛠️ Adding assigned_question_id column to team_tiers table...");
  await db.execute(sql`
    ALTER TABLE team_tiers 
    ADD COLUMN IF NOT EXISTS assigned_question_id UUID REFERENCES questions(id) ON DELETE SET NULL;
  `);
  console.log("✅ Column assigned_question_id added successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
