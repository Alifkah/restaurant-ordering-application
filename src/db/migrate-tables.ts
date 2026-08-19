import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL is missing.");
  process.exit(1);
}

const sql = neon(connectionString);

async function runMigration() {
  console.log("🚀 Running Table & Dine-in schema migration on Neon PostgreSQL...");

  try {
    // 1. Create order_type ENUM
    console.log("1️⃣ Creating order_type ENUM if not exists...");
    await sql`
      DO $$ 
      BEGIN 
        CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway'); 
      EXCEPTION 
        WHEN duplicate_object THEN null; 
      END $$;
    `;

    // 2. Create restaurant_tables table
    console.log("2️⃣ Creating restaurant_tables table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "restaurant_tables" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "table_number" varchar(20) NOT NULL UNIQUE,
        "qr_code_token" varchar(64) NOT NULL UNIQUE,
        "zone" varchar(50) DEFAULT 'Indoor' NOT NULL,
        "capacity" integer DEFAULT 4 NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    // 3. Add columns to orders table
    console.log("3️⃣ Updating orders table with order_type, table_number, table_id...");
    await sql`
      ALTER TABLE "orders" 
      ADD COLUMN IF NOT EXISTS "order_type" order_type DEFAULT 'dine_in' NOT NULL;
    `;

    await sql`
      ALTER TABLE "orders" 
      ADD COLUMN IF NOT EXISTS "table_number" varchar(20);
    `;

    await sql`
      ALTER TABLE "orders" 
      ADD COLUMN IF NOT EXISTS "table_id" uuid REFERENCES "restaurant_tables"("id") ON DELETE SET NULL;
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS "orders_table_id_idx" ON "orders" ("table_id");
    `;

    console.log("✅ Table & Dine-in schema migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

runMigration();
