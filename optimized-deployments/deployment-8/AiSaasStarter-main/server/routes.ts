import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { advancedRAG } from "./advanced-rag";
import { insertCustomerSchema, insertQuoteSchema, insertChatMessageSchema, insertCommandSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

const chatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

const commandRequestSchema = z.object({
  command: z.string().min(1),
  async: z.boolean().default(false),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Customers (CRM)
  app.get("/api/customers", async (req, res) => {
    try {
      const { search, status } = req.query;
      const customers = await storage.getCustomers(
        search as string, 
        status as string
      );
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(validatedData);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.put("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertQuoteSchema.partial().parse(req.body);
      const quote = await storage.updateQuote(id, validatedData);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuote(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = chatRequestSchema.parse(req.body);
      
      // Get or create chat session
      let session;
      if (sessionId) {
        session = await storage.getChatSession(sessionId);
      }
      
      if (!session) {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        session = await storage.createChatSession({
          sessionId: newSessionId,
          userId: null, // For now, not tracking users
        });
      }

      // Add user message
      await storage.addChatMessage({
        sessionId: session.id,
        content: message,
        isUser: true,
      });

      // Use advanced RAG system with open-source LLM integration
      const ragResponse = await advancedRAG.getAdvancedResponse(message, session.sessionId);
      
      await storage.addChatMessage({
        sessionId: session.id,
        content: ragResponse.reply,
        isUser: false,
      });

      res.json({
        reply: ragResponse.reply,
        sessionId: ragResponse.sessionId,
        results: ragResponse.results || [],
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chat request", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/chat/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      const messages = await storage.getChatMessages(session.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Configure multer for file uploads
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // Chat feedback endpoint
  app.post("/api/chat/feedback", async (req, res) => {
    try {
      const feedbackSchema = z.object({
        sessionId: z.string(),
        messageId: z.string(),
        userMessage: z.string(),
        botResponse: z.string(),
        feedback: z.boolean(),
        rating: z.number().min(1).max(5),
        timestamp: z.string().optional()
      });

      const feedbackData = feedbackSchema.parse(req.body);
      
      const feedbackId = advancedRAG.addFeedback({
        sessionId: feedbackData.sessionId,
        message: feedbackData.userMessage,
        response: feedbackData.botResponse,
        rating: feedbackData.rating,
        feedback: feedbackData.feedback ? 'Helpful' : 'Not helpful'
      });
      
      res.json({ success: true, feedbackId });
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // Session feedback endpoint
  app.post("/api/chat/session-feedback", async (req, res) => {
    try {
      const sessionFeedbackSchema = z.object({
        sessionId: z.string(),
        rating: z.number().min(1).max(5),
        feedback: z.string().optional().default(""),
        messageCount: z.number(),
        timestamp: z.string().optional()
      });

      const feedbackData = sessionFeedbackSchema.parse(req.body);
      
      const feedbackId = advancedRAG.addFeedback({
        sessionId: feedbackData.sessionId,
        message: `Session feedback after ${feedbackData.messageCount} messages`,
        response: 'Overall session rating',
        rating: feedbackData.rating,
        feedback: feedbackData.feedback || `Session rated ${feedbackData.rating}/5 stars`
      });
      
      res.json({ success: true, feedbackId });
    } catch (error) {
      console.error("Session feedback error:", error);
      res.status(500).json({ error: "Failed to save session feedback" });
    }
  });

  // Feedback stats endpoint
  app.get("/api/chat/feedback-stats", async (req, res) => {
    try {
      const stats = advancedRAG.getFeedbackStats();
      res.json(stats);
    } catch (error) {
      console.error("Feedback stats error:", error);
      res.status(500).json({ error: "Failed to get feedback stats" });
    }
  });

  // Dataset upload endpoint
  app.post("/api/datasets/upload", upload.single('file'), async (req, res) => {
    try {
      const { name, description } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!name) {
        return res.status(400).json({ error: "Dataset name is required" });
      }

      const fs = await import('fs');
      const fileContent = fs.readFileSync(file.path, 'utf-8');
      
      let data: any[] = [];
      
      if (file.originalname.endsWith('.json')) {
        data = JSON.parse(fileContent);
      } else if (file.originalname.endsWith('.jsonl')) {
        data = fileContent.split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      } else {
        return res.status(400).json({ error: "Unsupported file format. Use JSON or JSONL." });
      }

      // Process and validate data
      const processedData = data.map(item => {
        if (item.input && item.output) {
          return { input: item.input, output: item.output, source: `custom_${name}` };
        } else if (item.question && item.answer) {
          return { input: item.question, output: item.answer, source: `custom_${name}` };
        } else if (item.prompt && item.response) {
          return { input: item.prompt, output: item.response, source: `custom_${name}` };
        }
        return null;
      }).filter((item): item is { input: string; output: string; source: string } => item !== null);

      if (processedData.length === 0) {
        return res.status(400).json({ error: "No valid data found in file" });
      }

      const success = advancedRAG.addCustomDataset(processedData, name);
      
      // Clean up uploaded file
      fs.unlinkSync(file.path);

      if (success) {
        res.json({
          message: "Dataset uploaded successfully",
          recordsAdded: processedData.length,
          dataset_id: Date.now()
        });
      } else {
        res.status(500).json({ error: "Failed to add dataset" });
      }
    } catch (error) {
      console.error("Dataset upload error:", error);
      res.status(500).json({ error: "Failed to process dataset" });
    }
  });

  // Dataset info endpoint
  app.get("/api/datasets/info", async (req, res) => {
    try {
      const info = advancedRAG.getDatasetInfo();
      res.json(info);
    } catch (error) {
      console.error("Dataset info error:", error);
      res.status(500).json({ error: "Failed to get dataset info" });
    }
  });

  // Feedback stats endpoint
  app.get("/api/feedback/stats", async (req, res) => {
    try {
      const stats = advancedRAG.getFeedbackStats();
      res.json(stats);
    } catch (error) {
      console.error("Feedback stats error:", error);
      res.status(500).json({ error: "Failed to get feedback stats" });
    }
  });

  // Commands
  app.post("/api/command", async (req, res) => {
    try {
      const { command, async } = commandRequestSchema.parse(req.body);
      
      const commandRecord = await storage.createCommand({
        command,
        async,
        userId: null, // For now, not tracking users
      });

      // Simulate command execution
      setTimeout(async () => {
        const output = `Executed command: ${command}\n\nCommand completed successfully at ${new Date().toISOString()}`;
        await storage.updateCommandStatus(commandRecord.id, "completed", output);
      }, async ? 1000 : 500);

      if (async) {
        res.json({
          message: "Command queued for execution",
          commandId: commandRecord.id,
          status: "pending",
        });
      } else {
        // Wait for completion for synchronous commands
        setTimeout(async () => {
          const updatedCommand = await storage.updateCommandStatus(
            commandRecord.id, 
            "completed", 
            `Executed command: ${command}\n\nCommand completed successfully at ${new Date().toISOString()}`
          );
          
          if (updatedCommand) {
            res.json({
              message: "Command executed successfully",
              commandId: commandRecord.id,
              output: updatedCommand.output,
              status: updatedCommand.status,
            });
          }
        }, 500);
        
        return; // Don't send response yet
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid command request", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to execute command" });
    }
  });

  app.get("/api/commands", async (req, res) => {
    try {
      const commands = await storage.getCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch commands" });
    }
  });

  app.get("/api/commands/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commands = await storage.getCommands();
      const command = commands.find(c => c.id === id);
      
      if (!command) {
        return res.status(404).json({ message: "Command not found" });
      }
      
      res.json(command);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch command" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
