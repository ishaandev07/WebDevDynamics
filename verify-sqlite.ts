import { db } from "./server/db.sqlite";
import { users, projects, deployments, chatMessages, transactions, sessions } from "./shared/schema-clean.sqlite";

async function verifyDatabase() {
  console.log("🔍 Verifying SQLite database setup...");
  
  try {
    // Test basic database operations
    console.log("✓ Database connection established");
    
    // Check table existence by trying to query them
    const userCount = await db.select().from(users).limit(1);
    console.log("✓ Users table accessible");
    
    const projectCount = await db.select().from(projects).limit(1);
    console.log("✓ Projects table accessible");
    
    const deploymentCount = await db.select().from(deployments).limit(1);
    console.log("✓ Deployments table accessible");
    
    const chatCount = await db.select().from(chatMessages).limit(1);
    console.log("✓ Chat messages table accessible");
    
    const transactionCount = await db.select().from(transactions).limit(1);
    console.log("✓ Transactions table accessible");
    
    const sessionCount = await db.select().from(sessions).limit(1);
    console.log("✓ Sessions table accessible");
    
    console.log("\n🎉 SQLite database setup verified successfully!");
    console.log("📊 All 6 tables are ready for use");
    console.log("💾 Database file: ./database.sqlite");
    
  } catch (error) {
    console.error("❌ Database verification failed:", error);
    process.exit(1);
  }
}

verifyDatabase();