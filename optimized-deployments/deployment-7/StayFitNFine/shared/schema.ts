import { mysqlTable, text, int, decimal, boolean, timestamp, json, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with authentication and roles
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 20 }).notNull().default("user"), // user, admin, dietician
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// User sessions for authentication
export const userSessions = mysqlTable("user_sessions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Consultation types table
export const consultationTypes = mysqlTable("consultation_types", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: int("duration").notNull(), // in minutes
  features: json("features").$type<string[]>().notNull(),
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Client inquiries/bookings table
export const clientInquiries = mysqlTable("client_inquiries", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"), // optional - for registered users
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  consultationType: varchar("consultation_type", { length: 200 }).notNull(),
  healthGoals: text("health_goals"),
  selectedPlan: varchar("selected_plan", { length: 200 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, completed, cancelled
  calendlyEventId: text("calendly_event_id"),
  notes: text("notes"),
  assignedDietician: int("assigned_dietician"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Contact form submissions table
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"), // optional - for registered users
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("new"), // new, responded, closed
  respondedBy: int("responded_by"),
  responseText: text("response_text"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Blog posts table
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  authorId: int("author_id").notNull(),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  metaTitle: varchar("meta_title", { length: 300 }),
  metaDescription: text("meta_description"),
  tags: json("tags").$type<string[]>(),
  viewCount: int("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Testimonials table
export const testimonials = mysqlTable("testimonials", {
  id: int("id").primaryKey().autoincrement(),
  clientName: varchar("client_name", { length: 200 }).notNull(),
  clientTitle: varchar("client_title", { length: 200 }),
  clientImage: text("client_image"),
  testimonialText: text("testimonial_text").notNull(),
  rating: int("rating").notNull().default(5),
  achievement: text("achievement"),
  isPublished: boolean("is_published").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Health assessments table (for free lead generation)
export const healthAssessments = mysqlTable("health_assessments", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"), // optional - for registered users
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  age: int("age").notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  height: decimal("height", { precision: 5, scale: 2 }).notNull(), // in cm
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // in kg
  bmi: decimal("bmi", { precision: 4, scale: 2 }).notNull(),
  activityLevel: varchar("activity_level", { length: 50 }).notNull(),
  healthGoals: text("health_goals"),
  medicalConditions: text("medical_conditions"),
  dietaryRestrictions: text("dietary_restrictions"),
  assessmentScore: int("assessment_score"), // calculated health score
  recommendations: text("recommendations"),
  followUpConsent: boolean("follow_up_consent").default(false),
  followedUp: boolean("followed_up").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Free tools usage tracking
export const toolUsage = mysqlTable("tool_usage", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"), // optional
  email: varchar("email", { length: 255 }),
  toolName: varchar("tool_name", { length: 100 }).notNull(), // bmi_calculator, meal_planner, calorie_counter
  inputData: json("input_data"),
  result: json("result"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nutrition meal plans
export const mealPlans = mysqlTable("meal_plans", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // weight_loss, muscle_gain, maintenance
  calories: int("calories").notNull(),
  duration: int("duration").notNull(), // days
  meals: json("meals").$type<any[]>().notNull(),
  isTemplate: boolean("is_template").default(false),
  isPublic: boolean("is_public").default(false),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertConsultationTypeSchema = createInsertSchema(consultationTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientInquirySchema = createInsertSchema(clientInquiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  calendlyEventId: true,
  assignedDietician: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  respondedBy: true,
  responseText: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  viewCount: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthAssessmentSchema = createInsertSchema(healthAssessments).omit({
  id: true,
  createdAt: true,
  bmi: true,
  assessmentScore: true,
  recommendations: true,
  followedUp: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UserSession = typeof userSessions.$inferSelect;

export type ConsultationType = typeof consultationTypes.$inferSelect;
export type InsertConsultationType = z.infer<typeof insertConsultationTypeSchema>;

export type ClientInquiry = typeof clientInquiries.$inferSelect;
export type InsertClientInquiry = z.infer<typeof insertClientInquirySchema>;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type HealthAssessment = typeof healthAssessments.$inferSelect;
export type InsertHealthAssessment = z.infer<typeof insertHealthAssessmentSchema>;

export type ToolUsage = typeof toolUsage.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;