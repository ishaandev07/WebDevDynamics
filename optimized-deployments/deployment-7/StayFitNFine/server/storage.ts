import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  type User,
  type InsertUser,
  type LoginUser,
  type UserSession,
  type ConsultationType,
  type InsertConsultationType,
  type ClientInquiry,
  type InsertClientInquiry,
  type ContactSubmission,
  type InsertContactSubmission,
  type BlogPost,
  type InsertBlogPost,
  type Testimonial,
  type InsertTestimonial,
  type HealthAssessment,
  type InsertHealthAssessment,
  type ToolUsage,
  type MealPlan,
  type InsertMealPlan,
} from "@shared/schema";

export interface IStorage {
  // User authentication methods
  createUser(user: Omit<InsertUser, 'confirmPassword'>): Promise<User>;
  loginUser(credentials: LoginUser): Promise<{ user: User; sessionToken: string } | null>;
  getUserBySession(sessionToken: string): Promise<User | null>;
  logoutUser(sessionToken: string): Promise<void>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Consultation type methods
  getConsultationTypes(): Promise<ConsultationType[]>;
  getActiveConsultationTypes(): Promise<ConsultationType[]>;
  getConsultationType(id: number): Promise<ConsultationType | undefined>;
  createConsultationType(consultationType: InsertConsultationType): Promise<ConsultationType>;
  updateConsultationType(id: number, updates: Partial<ConsultationType>): Promise<ConsultationType | undefined>;
  deleteConsultationType(id: number): Promise<boolean>;
  
  // Client inquiry methods
  getClientInquiries(): Promise<ClientInquiry[]>;
  getClientInquiry(id: number): Promise<ClientInquiry | undefined>;
  getUserClientInquiries(userId: number): Promise<ClientInquiry[]>;
  createClientInquiry(inquiry: InsertClientInquiry): Promise<ClientInquiry>;
  updateClientInquiry(id: number, updates: Partial<ClientInquiry>): Promise<ClientInquiry | undefined>;
  deleteClientInquiry(id: number): Promise<boolean>;
  
  // Contact submission methods
  getContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmission(id: number): Promise<ContactSubmission | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  updateContactSubmission(id: number, updates: Partial<ContactSubmission>): Promise<ContactSubmission | undefined>;
  deleteContactSubmission(id: number): Promise<boolean>;
  
  // Blog post methods
  getBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  incrementBlogPostViews(id: number): Promise<void>;
  
  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  getPublishedTestimonials(): Promise<Testimonial[]>;
  getFeaturedTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;

  // Health assessment methods
  getHealthAssessments(): Promise<HealthAssessment[]>;
  getHealthAssessment(id: number): Promise<HealthAssessment | undefined>;
  getUserHealthAssessments(userId: number): Promise<HealthAssessment[]>;
  createHealthAssessment(assessment: InsertHealthAssessment): Promise<HealthAssessment>;
  updateHealthAssessment(id: number, updates: Partial<HealthAssessment>): Promise<HealthAssessment | undefined>;

  // Tool usage tracking
  createToolUsage(usage: Omit<ToolUsage, 'id' | 'createdAt'>): Promise<ToolUsage>;
  getToolUsageStats(): Promise<any>;

  // Meal plan methods
  getMealPlans(): Promise<MealPlan[]>;
  getPublicMealPlans(): Promise<MealPlan[]>;
  getUserMealPlans(userId: number): Promise<MealPlan[]>;
  getMealPlan(id: number): Promise<MealPlan | undefined>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: number, updates: Partial<MealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private userSessions: UserSession[] = [];
  private consultationTypes: ConsultationType[] = [];
  private clientInquiries: ClientInquiry[] = [];
  private contactSubmissions: ContactSubmission[] = [];
  private blogPosts: BlogPost[] = [];
  private testimonials: Testimonial[] = [];
  private healthAssessments: HealthAssessment[] = [];
  private toolUsage: ToolUsage[] = [];
  private mealPlans: MealPlan[] = [];
  private nextId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample consultation types
    this.consultationTypes = [
      {
        id: 1,
        name: "Basic Consultation",
        description: "30-minute one-on-one consultation covering basic nutritional guidance and meal planning",
        price: "₹3,000",
        duration: 30,
        features: ["Nutritional Assessment", "Basic Meal Plan", "Follow-up Email"],
        isActive: true,
        isPopular: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: "Premium Consultation",
        description: "60-minute comprehensive consultation with detailed meal plans and ongoing support",
        price: "₹7,000",
        duration: 60,
        features: ["Comprehensive Assessment", "Custom Meal Plan", "Recipe Guide", "2-Week Follow-up"],
        isActive: true,
        isPopular: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: "Elite Package",
        description: "90-minute intensive consultation plus 3-month ongoing support and monitoring",
        price: "₹11,000",
        duration: 90,
        features: ["Complete Health Analysis", "3-Month Meal Plans", "Weekly Check-ins", "Recipe Collection", "Shopping Lists", "Progress Tracking"],
        isActive: true,
        isPopular: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialize with sample testimonials
    this.testimonials = [
      {
        id: 1,
        clientName: "Sarah Johnson",
        clientTitle: "Software Engineer",
        clientImage: null,
        testimonialText: "Working with StayFitNFine transformed my relationship with food. I lost 25 pounds and feel more energetic than ever!",
        rating: 5,
        achievement: "Lost 25 pounds in 4 months",
        isPublished: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        clientName: "Ishita Sharma",
        clientTitle: "Marketing Manager", 
        clientImage: null,
        testimonialText: "The personalized meal plans were exactly what I needed. Finally found a sustainable approach to healthy eating that fits my busy lifestyle.",
        rating: 5,
        achievement: "Improved energy levels and digestive health",
        isPublished: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        clientName: "Emily Rodriguez",
        clientTitle: "Teacher",
        clientImage: null,
        testimonialText: "Professional, knowledgeable, and caring. The consultation exceeded my expectations completely. The nutrition plan is easy to follow.",
        rating: 5,
        achievement: "Better sleep and reduced stress eating",
        isPublished: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialize with sample blog posts
    this.blogPosts = [
      {
        id: 1,
        title: "10 Essential Nutrients for Optimal Health",
        slug: "10-essential-nutrients-optimal-health",
        excerpt: "Discover the key nutrients your body needs to function at its best and where to find them in whole foods.",
        content: "Proper nutrition is the foundation of good health. Here are the 10 essential nutrients your body needs...",
        category: "Nutrition",
        authorId: 1,
        imageUrl: "/images/blog/nutrients.jpg",
        isPublished: true,
        publishedAt: new Date(),
        viewCount: 245,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: "Meal Prep Made Simple: A Beginner's Guide",
        slug: "meal-prep-simple-beginners-guide",
        excerpt: "Learn how to meal prep effectively with our step-by-step guide for busy professionals.",
        content: "Meal prepping can save time, money, and help you maintain a healthy diet. Here's how to get started...",
        category: "Meal Planning",
        authorId: 1,
        imageUrl: "/images/blog/meal-prep.jpg",
        isPublished: true,
        publishedAt: new Date(),
        viewCount: 189,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.nextId = 4;
  }

  // User authentication methods
  async createUser(userData: Omit<InsertUser, 'confirmPassword'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user: User = {
      id: this.nextId++,
      ...userData,
      password: hashedPassword,
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async loginUser(credentials: LoginUser): Promise<{ user: User; sessionToken: string } | null> {
    const user = this.users.find(u => u.email === credentials.email && u.isActive);
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) return null;

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session: UserSession = {
      id: this.nextId++,
      userId: user.id,
      sessionToken,
      expiresAt,
      createdAt: new Date()
    };

    this.userSessions.push(session);
    return { user, sessionToken };
  }

  async getUserBySession(sessionToken: string): Promise<User | null> {
    const session = this.userSessions.find(s => s.sessionToken === sessionToken);
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        this.userSessions = this.userSessions.filter(s => s.sessionToken !== sessionToken);
      }
      return null;
    }

    const user = this.users.find(u => u.id === session.userId && u.isActive);
    return user || null;
  }

  async logoutUser(sessionToken: string): Promise<void> {
    this.userSessions = this.userSessions.filter(s => s.sessionToken !== sessionToken);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date() };
    return this.users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.users[index].isActive = false;
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users.filter(u => u.isActive);
  }

  // Consultation type methods
  async getConsultationTypes(): Promise<ConsultationType[]> {
    return [...this.consultationTypes];
  }

  async getActiveConsultationTypes(): Promise<ConsultationType[]> {
    return this.consultationTypes.filter(ct => ct.isActive);
  }

  async getConsultationType(id: number): Promise<ConsultationType | undefined> {
    return this.consultationTypes.find(ct => ct.id === id);
  }

  async createConsultationType(consultationType: InsertConsultationType): Promise<ConsultationType> {
    const newType: ConsultationType = {
      id: this.nextId++,
      ...consultationType,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.consultationTypes.push(newType);
    return newType;
  }

  async updateConsultationType(id: number, updates: Partial<ConsultationType>): Promise<ConsultationType | undefined> {
    const index = this.consultationTypes.findIndex(ct => ct.id === id);
    if (index === -1) return undefined;

    this.consultationTypes[index] = { ...this.consultationTypes[index], ...updates, updatedAt: new Date() };
    return this.consultationTypes[index];
  }

  async deleteConsultationType(id: number): Promise<boolean> {
    const index = this.consultationTypes.findIndex(ct => ct.id === id);
    if (index === -1) return false;

    this.consultationTypes[index].isActive = false;
    return true;
  }

  // Client inquiry methods
  async getClientInquiries(): Promise<ClientInquiry[]> {
    return [...this.clientInquiries].sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getClientInquiry(id: number): Promise<ClientInquiry | undefined> {
    return this.clientInquiries.find(ci => ci.id === id);
  }

  async getUserClientInquiries(userId: number): Promise<ClientInquiry[]> {
    return this.clientInquiries.filter(ci => ci.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createClientInquiry(inquiry: InsertClientInquiry): Promise<ClientInquiry> {
    const newInquiry: ClientInquiry = {
      id: this.nextId++,
      ...inquiry,
      status: 'pending',
      followedUp: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clientInquiries.push(newInquiry);
    return newInquiry;
  }

  async updateClientInquiry(id: number, updates: Partial<ClientInquiry>): Promise<ClientInquiry | undefined> {
    const index = this.clientInquiries.findIndex(ci => ci.id === id);
    if (index === -1) return undefined;

    this.clientInquiries[index] = { ...this.clientInquiries[index], ...updates, updatedAt: new Date() };
    return this.clientInquiries[index];
  }

  async deleteClientInquiry(id: number): Promise<boolean> {
    const index = this.clientInquiries.findIndex(ci => ci.id === id);
    if (index === -1) return false;

    this.clientInquiries.splice(index, 1);
    return true;
  }

  // Contact submission methods
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return [...this.contactSubmissions].sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    return this.contactSubmissions.find(cs => cs.id === id);
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const newSubmission: ContactSubmission = {
      id: this.nextId++,
      ...submission,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contactSubmissions.push(newSubmission);
    return newSubmission;
  }

  async updateContactSubmission(id: number, updates: Partial<ContactSubmission>): Promise<ContactSubmission | undefined> {
    const index = this.contactSubmissions.findIndex(cs => cs.id === id);
    if (index === -1) return undefined;

    this.contactSubmissions[index] = { ...this.contactSubmissions[index], ...updates, updatedAt: new Date() };
    return this.contactSubmissions[index];
  }

  async deleteContactSubmission(id: number): Promise<boolean> {
    const index = this.contactSubmissions.findIndex(cs => cs.id === id);
    if (index === -1) return false;

    this.contactSubmissions.splice(index, 1);
    return true;
  }

  // Blog post methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return [...this.blogPosts].sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return this.blogPosts.filter(bp => bp.isPublished)
      .sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.find(bp => bp.id === id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return this.blogPosts.find(bp => bp.slug === slug);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const newPost: BlogPost = {
      id: this.nextId++,
      ...post,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogPosts.push(newPost);
    return newPost;
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const index = this.blogPosts.findIndex(bp => bp.id === id);
    if (index === -1) return undefined;

    this.blogPosts[index] = { ...this.blogPosts[index], ...updates, updatedAt: new Date() };
    return this.blogPosts[index];
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const index = this.blogPosts.findIndex(bp => bp.id === id);
    if (index === -1) return false;

    this.blogPosts.splice(index, 1);
    return true;
  }

  async incrementBlogPostViews(id: number): Promise<void> {
    const index = this.blogPosts.findIndex(bp => bp.id === id);
    if (index !== -1) {
      this.blogPosts[index].viewCount = (this.blogPosts[index].viewCount || 0) + 1;
    }
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return [...this.testimonials].sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPublishedTestimonials(): Promise<Testimonial[]> {
    return this.testimonials.filter(t => t.isPublished)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    return this.testimonials.filter(t => t.isPublished && t.isFeatured)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.find(t => t.id === id);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const newTestimonial: Testimonial = {
      id: this.nextId++,
      ...testimonial,
      isPublished: false,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.testimonials.push(newTestimonial);
    return newTestimonial;
  }

  async updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<Testimonial | undefined> {
    const index = this.testimonials.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    this.testimonials[index] = { ...this.testimonials[index], ...updates, updatedAt: new Date() };
    return this.testimonials[index];
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const index = this.testimonials.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.testimonials.splice(index, 1);
    return true;
  }

  // Health assessment methods
  async getHealthAssessments(): Promise<HealthAssessment[]> {
    return [...this.healthAssessments].sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getHealthAssessment(id: number): Promise<HealthAssessment | undefined> {
    return this.healthAssessments.find(ha => ha.id === id);
  }

  async getUserHealthAssessments(userId: number): Promise<HealthAssessment[]> {
    return this.healthAssessments.filter(ha => ha.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createHealthAssessment(assessment: InsertHealthAssessment): Promise<HealthAssessment> {
    // Calculate BMI
    const heightInM = parseFloat(assessment.height.toString()) / 100;
    const weightInKg = parseFloat(assessment.weight.toString());
    const bmi = parseFloat((weightInKg / (heightInM * heightInM)).toFixed(2));
    
    // Calculate assessment score based on various factors
    let score = 70; // Base score
    
    // BMI scoring
    if (bmi >= 18.5 && bmi <= 24.9) score += 15;
    else if (bmi >= 25 && bmi <= 29.9) score += 5;
    else score -= 10;
    
    // Age scoring
    const age = assessment.age;
    if (age >= 18 && age <= 30) score += 10;
    else if (age >= 31 && age <= 50) score += 5;
    
    // Activity level scoring
    switch (assessment.activityLevel) {
      case 'very_active': score += 15; break;
      case 'active': score += 10; break;
      case 'moderate': score += 5; break;
      case 'sedentary': score -= 5; break;
    }
    
    // Generate basic recommendations
    let recommendations = "Based on your assessment: ";
    if (bmi < 18.5) recommendations += "Consider increasing caloric intake with nutritious foods. ";
    else if (bmi > 25) recommendations += "Focus on portion control and regular exercise. ";
    else recommendations += "Maintain your current healthy weight. ";
    
    if (assessment.activityLevel === 'sedentary') {
      recommendations += "Increase physical activity gradually. ";
    }
    
    recommendations += "Consult with our dietician for a personalized meal plan.";
    
    const newAssessment: HealthAssessment = {
      id: this.nextId++,
      ...assessment,
      bmi: bmi.toString(),
      assessmentScore: Math.max(0, Math.min(100, score)),
      recommendations,
      createdAt: new Date()
    };
    this.healthAssessments.push(newAssessment);
    return newAssessment;
  }

  async updateHealthAssessment(id: number, updates: Partial<HealthAssessment>): Promise<HealthAssessment | undefined> {
    const index = this.healthAssessments.findIndex(ha => ha.id === id);
    if (index === -1) return undefined;

    this.healthAssessments[index] = { ...this.healthAssessments[index], ...updates };
    return this.healthAssessments[index];
  }

  // Tool usage tracking
  async createToolUsage(usage: Omit<ToolUsage, 'id' | 'createdAt'>): Promise<ToolUsage> {
    const newUsage: ToolUsage = {
      id: this.nextId++,
      ...usage,
      createdAt: new Date()
    };
    this.toolUsage.push(newUsage);
    return newUsage;
  }

  async getToolUsageStats(): Promise<any> {
    return this.toolUsage;
  }

  // Meal plan methods
  async getMealPlans(): Promise<MealPlan[]> {
    return [...this.mealPlans].sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPublicMealPlans(): Promise<MealPlan[]> {
    return this.mealPlans.filter(mp => mp.isPublic)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getUserMealPlans(userId: number): Promise<MealPlan[]> {
    return this.mealPlans.filter(mp => mp.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getMealPlan(id: number): Promise<MealPlan | undefined> {
    return this.mealPlans.find(mp => mp.id === id);
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const newPlan: MealPlan = {
      id: this.nextId++,
      ...mealPlan,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mealPlans.push(newPlan);
    return newPlan;
  }

  async updateMealPlan(id: number, updates: Partial<MealPlan>): Promise<MealPlan | undefined> {
    const index = this.mealPlans.findIndex(mp => mp.id === id);
    if (index === -1) return undefined;

    this.mealPlans[index] = { ...this.mealPlans[index], ...updates, updatedAt: new Date() };
    return this.mealPlans[index];
  }

  async deleteMealPlan(id: number): Promise<boolean> {
    const index = this.mealPlans.findIndex(mp => mp.id === id);
    if (index === -1) return false;

    this.mealPlans.splice(index, 1);
    return true;
  }
}

export const storage = new MemStorage();