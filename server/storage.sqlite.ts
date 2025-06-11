import {
  users,
  projects,
  deployments,
  chatMessages,
  transactions,
  type User,
  type UpsertUser,
  type InsertProject,
  type Project,
  type InsertDeployment,
  type Deployment,
  type InsertChatMessage,
  type ChatMessage,
  type InsertTransaction,
  type Transaction,
} from "../shared/schema.sqlite";
import { db } from "./db.sqlite";
import { eq, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Deployment operations
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  getDeploymentsByUser(userId: string): Promise<Deployment[]>;
  getDeploymentsByProject(projectId: number): Promise<Deployment[]>;
  updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment | undefined>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId: string, projectId?: number): Promise<ChatMessage[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  
  // User update operations
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    totalProjects: number;
    successfulDeployments: number;
    failedDeployments: number;
    inProgressDeployments: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.changes > 0;
  }

  // Deployment operations
  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const [newDeployment] = await db.insert(deployments).values(deployment).returning();
    return newDeployment;
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
    return deployment;
  }

  async getDeploymentsByUser(userId: string): Promise<Deployment[]> {
    return await db
      .select()
      .from(deployments)
      .where(eq(deployments.userId, userId))
      .orderBy(desc(deployments.createdAt));
  }

  async getDeploymentsByProject(projectId: number): Promise<Deployment[]> {
    return await db
      .select()
      .from(deployments)
      .where(eq(deployments.projectId, projectId))
      .orderBy(desc(deployments.createdAt));
  }

  async updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment | undefined> {
    const [updatedDeployment] = await db
      .update(deployments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deployments.id, id))
      .returning();
    return updatedDeployment;
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getChatMessages(userId: string, projectId?: number): Promise<ChatMessage[]> {
    if (projectId) {
      return await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, userId) && eq(chatMessages.projectId, projectId))
        .orderBy(chatMessages.createdAt);
    }

    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    totalProjects: number;
    successfulDeployments: number;
    failedDeployments: number;
    inProgressDeployments: number;
  }> {
    const [projectStats] = await db
      .select({
        totalProjects: sql<number>`count(*)`,
      })
      .from(projects)
      .where(eq(projects.userId, userId));

    const [deploymentStats] = await db
      .select({
        successfulDeployments: sql<number>`count(case when status = 'deployed' then 1 end)`,
        failedDeployments: sql<number>`count(case when status = 'failed' then 1 end)`,
        inProgressDeployments: sql<number>`count(case when status in ('pending', 'deploying') then 1 end)`,
      })
      .from(deployments)
      .where(eq(deployments.userId, userId));

    return {
      totalProjects: projectStats?.totalProjects || 0,
      successfulDeployments: deploymentStats?.successfulDeployments || 0,
      failedDeployments: deploymentStats?.failedDeployments || 0,
      inProgressDeployments: deploymentStats?.inProgressDeployments || 0,
    };
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // User update operations
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();