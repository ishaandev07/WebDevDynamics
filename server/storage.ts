import {
  users,
  projects,
  deployments,
  chatMessages,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Deployment,
  type InsertDeployment,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    totalProjects: number;
    successfulDeployments: number;
    failedDeployments: number;
    inProgressDeployments: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
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
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Deployment operations
  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const [newDeployment] = await db
      .insert(deployments)
      .values(deployment)
      .returning();
    return newDeployment;
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db
      .select()
      .from(deployments)
      .where(eq(deployments.id, id));
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
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getChatMessages(userId: string, projectId?: number): Promise<ChatMessage[]> {
    const conditions = projectId 
      ? and(eq(chatMessages.userId, userId), eq(chatMessages.projectId, projectId))
      : eq(chatMessages.userId, userId);
      
    return await db
      .select()
      .from(chatMessages)
      .where(conditions)
      .orderBy(chatMessages.createdAt);
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    totalProjects: number;
    successfulDeployments: number;
    failedDeployments: number;
    inProgressDeployments: number;
  }> {
    const userProjects = await this.getProjectsByUser(userId);
    const userDeployments = await this.getDeploymentsByUser(userId);

    return {
      totalProjects: userProjects.length,
      successfulDeployments: userDeployments.filter(d => d.status === 'deployed').length,
      failedDeployments: userDeployments.filter(d => d.status === 'failed').length,
      inProgressDeployments: userDeployments.filter(d => ['pending', 'building', 'deploying'].includes(d.status)).length,
    };
  }
}

export const storage = new DatabaseStorage();
