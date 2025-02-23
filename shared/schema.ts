import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  type: text("type", { enum: ["business", "consumer"] }).notNull(),
  name: text("name").notNull(),
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  services: text("services").array().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromId: integer("from_id").notNull(),
  toId: integer("to_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isAiAssistant: boolean("is_ai_assistant").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  type: true,
  name: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).pick({
  description: true,
  category: true,
  location: true,
  services: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  fromId: true,
  toId: true,
  content: true,
  isAiAssistant: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type User = typeof users.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Message = typeof messages.$inferSelect;