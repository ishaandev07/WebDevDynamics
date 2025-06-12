import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertContactSubmissionSchema, insertClientInquirySchema, insertHealthAssessmentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.sessionToken;
  
  if (!sessionToken) {
    return res.status(401).json({ message: "Authentication required" });
  }

  storage.getUserBySession(sessionToken)
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: "Invalid session" });
      }
      req.user = user;
      next();
    })
    .catch(() => {
      res.status(401).json({ message: "Authentication failed" });
    });
}

// Middleware to check admin role
function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).toString() 
        });
      }

      const { confirmPassword, ...userData } = result.data;
      
      // Check if passwords match
      if (userData.password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        message: "User created successfully", 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).toString() 
        });
      }

      const loginResult = await storage.loginUser(result.data);
      if (!loginResult) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { user, sessionToken } = loginResult;
      const { password, ...userWithoutPassword } = user;

      // Set session cookie
      res.cookie('sessionToken', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ 
        message: "Login successful", 
        user: userWithoutPassword,
        sessionToken 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', requireAuth, async (req: any, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.sessionToken;
      if (sessionToken) {
        await storage.logoutUser(sessionToken);
      }
      res.clearCookie('sessionToken');
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // User management routes (admin only)
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Consultation types routes
  app.get('/api/consultation-types', async (req, res) => {
    try {
      const consultationTypes = await storage.getActiveConsultationTypes();
      res.json(consultationTypes);
    } catch (error) {
      console.error("Error fetching consultation types:", error);
      res.status(500).json({ message: "Failed to fetch consultation types" });
    }
  });

  app.post('/api/admin/consultation-types', requireAuth, requireAdmin, async (req, res) => {
    try {
      const consultationType = await storage.createConsultationType(req.body);
      res.status(201).json(consultationType);
    } catch (error) {
      console.error("Error creating consultation type:", error);
      res.status(500).json({ message: "Failed to create consultation type" });
    }
  });

  // Contact submissions
  app.post('/api/contact', async (req, res) => {
    try {
      const result = insertContactSubmissionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).toString() 
        });
      }

      const submission = await storage.createContactSubmission(result.data);
      res.status(201).json({ 
        message: "Contact submission received successfully",
        id: submission.id 
      });
    } catch (error) {
      console.error("Error creating contact submission:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  app.get('/api/admin/contact-submissions', requireAuth, requireAdmin, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  // Client inquiries (booking requests)
  app.post('/api/booking', requireAuth, async (req: any, res) => {
    try {
      const result = insertClientInquirySchema.safeParse({
        ...req.body,
        userId: req.user.id
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).toString() 
        });
      }

      const inquiry = await storage.createClientInquiry(result.data);
      res.status(201).json({ 
        message: "Booking request submitted successfully",
        id: inquiry.id 
      });
    } catch (error) {
      console.error("Error creating booking request:", error);
      res.status(500).json({ message: "Failed to submit booking request" });
    }
  });

  app.get('/api/user/bookings', requireAuth, async (req: any, res) => {
    try {
      const inquiries = await storage.getUserClientInquiries(req.user.id);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/admin/client-inquiries', requireAuth, requireAdmin, async (req, res) => {
    try {
      const inquiries = await storage.getClientInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching client inquiries:", error);
      res.status(500).json({ message: "Failed to fetch client inquiries" });
    }
  });

  // Blog posts
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      await storage.incrementBlogPostViews(post.id);
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.get('/api/admin/blog', requireAuth, requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching all blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Testimonials
  app.get('/api/testimonials', async (req, res) => {
    try {
      const testimonials = await storage.getPublishedTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.get('/api/admin/testimonials', requireAuth, requireAdmin, async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching all testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Health assessments
  app.post('/api/health-assessment', async (req, res) => {
    try {
      const result = insertHealthAssessmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).toString() 
        });
      }

      const assessment = await storage.createHealthAssessment(result.data);
      
      // Track tool usage
      await storage.createToolUsage({
        toolName: 'Health Assessment',
        userId: result.data.userId || null,
        sessionId: req.headers['x-session-id'] || null
      });

      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating health assessment:", error);
      res.status(500).json({ message: "Failed to create health assessment" });
    }
  });

  app.get('/api/user/health-assessments', requireAuth, async (req: any, res) => {
    try {
      const assessments = await storage.getUserHealthAssessments(req.user.id);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching user health assessments:", error);
      res.status(500).json({ message: "Failed to fetch health assessments" });
    }
  });

  app.get('/api/admin/health-assessments', requireAuth, requireAdmin, async (req, res) => {
    try {
      const assessments = await storage.getHealthAssessments();
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching all health assessments:", error);
      res.status(500).json({ message: "Failed to fetch health assessments" });
    }
  });

  // Tool usage analytics
  app.get('/api/admin/analytics/tools', requireAuth, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getToolUsageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching tool usage stats:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Meal plans
  app.get('/api/meal-plans', async (req, res) => {
    try {
      const mealPlans = await storage.getPublicMealPlans();
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching public meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get('/api/user/meal-plans', requireAuth, async (req: any, res) => {
    try {
      const mealPlans = await storage.getUserMealPlans(req.user.id);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching user meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post('/api/admin/meal-plans', requireAuth, requireAdmin, async (req, res) => {
    try {
      const mealPlan = await storage.createMealPlan(req.body);
      res.status(201).json(mealPlan);
    } catch (error) {
      console.error("Error creating meal plan:", error);
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}