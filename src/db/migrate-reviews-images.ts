import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(connectionString);

async function runMigration() {
  console.log("🚀 Starting database migration for reviews image columns...");

  try {
    await sql`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS image_urls JSONB,
      ADD COLUMN IF NOT EXISTS image_public_ids JSONB;
    `;
    console.log("✅ reviews table updated with image_urls and image_public_ids successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration().then(() => process.exit(0));
