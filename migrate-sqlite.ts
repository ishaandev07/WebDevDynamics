import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db, sqlite } from "./server/db.sqlite";

async function runMigrations() {
  console.log("Running SQLite migrations...");
  
  try {
    // Run migrations
    migrate(db, { migrationsFolder: "./migrations" });
    console.log("✅ Migrations completed successfully!");
    
    // Close database connection
    sqlite.close();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();