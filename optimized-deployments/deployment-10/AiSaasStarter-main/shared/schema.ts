import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company"),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  quoteNumber: text("quote_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  description: text("description"),
  amount: text("amount").notNull(),
  validityDays: integer("validity_days").notNull().default(30),
});

export const chatSessions = sqliteTable("chat_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull().unique(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  userId: integer("user_id"),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull(),
  content: text("content").notNull(),
  isUser: integer("is_user", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const commands = sqliteTable("commands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  command: text("command").notNull(),
  async: integer("async", { mode: "boolean" }).notNull().default(false),
  output: text("output"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  userId: integer("user_id"),
  completedAt: text("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  email: true,
  company: true,
  phone: true,
  status: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  title: true,
  customerId: true,
  description: true,
  amount: true,
  validityDays: true,
  status: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  sessionId: true,
  userId: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  content: true,
  isUser: true,
});

export const insertCommandSchema = createInsertSchema(commands).pick({
  command: true,
  async: true,
  userId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Command = typeof commands.$inferSelect;
export type InsertCommand = z.infer<typeof insertCommandSchema>;

// Extended types for joins
export type QuoteWithCustomer = Quote & {
  customer: Customer;
};

export type ChatSessionWithMessages = ChatSession & {
  messages: ChatMessage[];
};

export type DashboardMetrics = {
  totalUsers: number;
  activeQuotes: number;
  chatSessions: number;
  revenue: string;
};

export type ChatResponse = {
  reply: string;
  sessionId: string;
  results?: any[];
  confidence?: number;
  category?: string;
};

export type CommandResult = {
  message: string;
  commandId: number;
  output?: string;
  status: string;
};