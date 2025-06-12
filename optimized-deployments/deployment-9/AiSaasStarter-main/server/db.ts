import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

// Create SQLite database
const sqlite = new Database("database.sqlite");

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Initialize database with sample data
export function initializeDatabase() {
  try {
    // Run migrations by creating tables if they don't exist
    console.log("Initializing SQLite database...");
    
    // Create tables manually since Drizzle doesn't auto-create SQLite tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        company TEXT,
        phone TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        quote_number TEXT NOT NULL UNIQUE,
        customer_id INTEGER NOT NULL,
        description TEXT,
        amount TEXT NOT NULL,
        validity_days INTEGER NOT NULL DEFAULT 30
      );
      
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_user INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS commands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command TEXT NOT NULL,
        async INTEGER NOT NULL DEFAULT 0,
        output TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        completed_at TEXT
      );
    `);
    
    // Insert sample data if tables are empty
    initializeSampleData();
    
    console.log("SQLite database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

function initializeSampleData() {
  try {
    // Check if we already have data
    const existingUsers = db.select().from(schema.users).limit(1).all();
    if (existingUsers.length > 0) {
      return; // Data already exists
    }

    // Insert sample users
    const sampleUsers = [
      {
        username: "admin",
        password: "hashed_password_1",
      },
      {
        username: "user1",
        password: "hashed_password_2",
      },
    ];

    for (const user of sampleUsers) {
      db.insert(schema.users).values(user).run();
    }

    // Insert sample customers
    const sampleCustomers = [
      {
        name: "Acme Corporation",
        email: "contact@acme.com",
        status: "active",
        company: "Acme Corporation",
        phone: "+1-555-0123",
      },
      {
        name: "Tech Solutions Inc",
        email: "info@techsolutions.com",
        status: "active",
        company: "Tech Solutions Inc",
        phone: "+1-555-0456",
      },
    ];

    const insertedCustomers = [];
    for (const customer of sampleCustomers) {
      const result = db.insert(schema.customers).values(customer).returning().get();
      insertedCustomers.push(result);
    }

    // Insert sample quotes
    const sampleQuotes = [
      {
        title: "Website Development",
        quoteNumber: "Q-2024-001",
        customerId: insertedCustomers[0].id,
        description: "Complete website development with modern design",
        amount: "$15,000",
        status: "pending",
        validityDays: 30,
      },
      {
        title: "Mobile App Development",
        quoteNumber: "Q-2024-002",
        customerId: insertedCustomers[1].id,
        description: "iOS and Android mobile application",
        amount: "$25,000",
        status: "approved",
        validityDays: 45,
      },
    ];

    for (const quote of sampleQuotes) {
      db.insert(schema.quotes).values(quote).run();
    }

    console.log("Sample data inserted successfully");
  } catch (error) {
    console.error("Error inserting sample data:", error);
  }
}