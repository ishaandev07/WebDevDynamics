import { eq, like, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  customers,
  quotes,
  chatSessions,
  chatMessages,
  commands,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Quote,
  type InsertQuote,
  type QuoteWithCustomer,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type Command,
  type InsertCommand,
  type DashboardMetrics,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customers
  getCustomers(search?: string, status?: string): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Quotes
  getQuotes(): Promise<QuoteWithCustomer[]>;
  getQuote(id: number): Promise<QuoteWithCustomer | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;

  // Chat
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;

  // Commands
  createCommand(command: InsertCommand): Promise<Command>;
  getCommands(userId?: number): Promise<Command[]>;
  updateCommandStatus(id: number, status: string, output?: string): Promise<Command | undefined>;

  // Dashboard
  getDashboardMetrics(): Promise<DashboardMetrics>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCustomers(search?: string, status?: string): Promise<Customer[]> {
    let query = db.select().from(customers);
    
    if (search) {
      query = query.where(
        like(customers.name, `%${search}%`)
      ) as any;
    }
    
    if (status) {
      query = query.where(eq(customers.status, status)) as any;
    }
    
    return await query;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values({
        ...insertCustomer,
        status: insertCustomer.status || "active"
      })
      .returning();
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.changes > 0;
  }

  async getQuotes(): Promise<QuoteWithCustomer[]> {
    const result = await db
      .select({
        id: quotes.id,
        title: quotes.title,
        status: quotes.status,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
        quoteNumber: quotes.quoteNumber,
        customerId: quotes.customerId,
        description: quotes.description,
        amount: quotes.amount,
        validityDays: quotes.validityDays,
        customer: customers
      })
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .orderBy(desc(quotes.createdAt));

    return result.map(row => ({
      ...row,
      customer: row.customer!
    }));
  }

  async getQuote(id: number): Promise<QuoteWithCustomer | undefined> {
    const [result] = await db
      .select({
        id: quotes.id,
        title: quotes.title,
        status: quotes.status,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
        quoteNumber: quotes.quoteNumber,
        customerId: quotes.customerId,
        description: quotes.description,
        amount: quotes.amount,
        validityDays: quotes.validityDays,
        customer: customers
      })
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .where(eq(quotes.id, id));

    if (!result || !result.customer) return undefined;

    return {
      ...result,
      customer: result.customer
    };
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db
      .insert(quotes)
      .values({
        title: insertQuote.title,
        customerId: insertQuote.customerId,
        description: insertQuote.description || null,
        amount: insertQuote.amount,
        validityDays: insertQuote.validityDays || 30,
        quoteNumber: `Q${Date.now()}`,
        status: insertQuote.status || "pending"
      })
      .returning();
    return quote;
  }

  async updateQuote(id: number, updates: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updated] = await db
      .update(quotes)
      .set(updates)
      .where(eq(quotes.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteQuote(id: number): Promise<boolean> {
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return result.changes > 0;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values({
        sessionId: insertSession.sessionId,
        userId: insertSession.userId || null
      })
      .returning();
    return session;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId));
    return session || undefined;
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const [command] = await db
      .insert(commands)
      .values({
        command: insertCommand.command,
        async: insertCommand.async || false,
        userId: insertCommand.userId || null,
        output: null,
        status: "pending",
        completedAt: null
      })
      .returning();
    return command;
  }

  async getCommands(userId?: number): Promise<Command[]> {
    let query = db.select().from(commands);
    
    if (userId) {
      query = query.where(eq(commands.userId, userId)) as any;
    }
    
    return await query.orderBy(desc(commands.createdAt));
  }

  async updateCommandStatus(id: number, status: string, output?: string): Promise<Command | undefined> {
    const [updated] = await db
      .update(commands)
      .set({
        status,
        output: output || null,
        completedAt: status === "completed" ? new Date().toISOString() : null
      })
      .where(eq(commands.id, id))
      .returning();
    return updated || undefined;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const allUsers = await db.select().from(users);
    const pendingQuotes = await db.select().from(quotes).where(eq(quotes.status, "pending"));
    const allSessions = await db.select().from(chatSessions);
    
    const approvedQuotes = await db
      .select({ amount: quotes.amount })
      .from(quotes)
      .where(eq(quotes.status, "approved"));
    
    const revenue = approvedQuotes.reduce((sum, quote) => {
      const amount = parseFloat(quote.amount.replace(/[$,]/g, ""));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return {
      totalUsers: allUsers.length,
      activeQuotes: pendingQuotes.length,
      chatSessions: allSessions.length,
      revenue: `$${revenue.toLocaleString()}`
    };
  }
}

export const storage = new DatabaseStorage();