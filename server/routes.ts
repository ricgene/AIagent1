import type { Express } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertBusinessSchema, insertMessageSchema } from "@shared/schema";
import { matchBusinessesToQuery } from "./anthropic";
import { ZodError } from "zod";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Add some sample business data
  const sampleBusinesses = [
    {
      username: "techhub",
      password: "password123",
      type: "business" as const,
      name: "TechHub Solutions",
    },
    {
      username: "homefix",
      password: "password123",
      type: "business" as const,
      name: "HomeFix Pro",
    },
    {
      username: "healthplus",
      password: "password123",
      type: "business" as const,
      name: "HealthPlus Services",
    },
  ];

  // Create sample users and their business profiles
  console.log("Creating sample businesses...");
  for (const business of sampleBusinesses) {
    try {
      console.log(`Creating user for ${business.name}...`);
      const user = await storage.createUser(business);
      console.log(`Created user:`, user);

      console.log(`Creating business profile for ${business.name}...`);
      await storage.createBusiness(user.id, {
        description: business.name === "TechHub Solutions"
          ? "Expert IT consulting and software development services. Specializing in web applications, mobile apps, and cloud solutions."
          : business.name === "HomeFix Pro"
          ? "Professional home repair and maintenance services. From basic repairs to major renovations, we do it all."
          : "Comprehensive healthcare services including preventive care, wellness programs, and specialized treatments.",
        category: business.name === "TechHub Solutions"
          ? "Technology"
          : business.name === "HomeFix Pro"
          ? "Home Services"
          : "Healthcare",
        location: "New York, NY",
        services: business.name === "TechHub Solutions"
          ? ["Web Development", "Mobile Apps", "Cloud Computing", "IT Consulting"]
          : business.name === "HomeFix Pro"
          ? ["Home Repairs", "Renovation", "Plumbing", "Electrical", "HVAC"]
          : ["Primary Care", "Wellness Programs", "Specialized Care", "Telemedicine"],
      });
      console.log(`Created business profile for ${business.name}`);
    } catch (error) {
      console.error(`Error creating sample business ${business.name}:`, error);
    }
  }

  // WebSocket setup for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  const clients = new Map<number, WebSocket>();

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "auth" && msg.userId) {
          clients.set(msg.userId, ws);
        }
      } catch (e) {
        console.error("WebSocket message error:", e);
      }
    });
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Business routes
  app.post("/api/businesses", async (req, res) => {
    try {
      const businessData = insertBusinessSchema.parse(req.body);
      if (!req.body.userId) {
        throw new Error("userId is required");
      }
      const business = await storage.createBusiness(req.body.userId, businessData);
      res.json(business);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/businesses/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      console.log("Search query received:", query);

      if (!query) {
        console.log("No query provided, returning empty array");
        return res.json([]);
      }

      // Get all businesses first
      const businesses = await storage.searchBusinesses(query);
      console.log("Found businesses before AI matching:", businesses.length);

      // Use Anthropic to perform semantic matching
      const matches = await matchBusinessesToQuery(query, businesses);
      console.log("AI matched businesses:", matches.length);

      res.json(matches);
    } catch (error) {
      console.error("Search error:", error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Message routes
  app.get("/api/messages/:userId1/:userId2", async (req, res) => {
    try {
      const messages = await storage.getMessages(
        parseInt(req.params.userId1),
        parseInt(req.params.userId2)
      );
      res.json(messages);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);

      // Notify recipient through WebSocket if connected
      const recipientWs = clients.get(message.toId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify(message));
      }

      res.json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  return httpServer;
}