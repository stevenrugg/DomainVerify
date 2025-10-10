import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Domain verification schema
export const verifications = pgTable("verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domain: text("domain").notNull(),
  method: varchar("method", { length: 20 }).notNull(), // 'dns' or 'file'
  token: text("token").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'verified', 'failed'
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

export const createVerificationSchema = z.object({
  domain: z.string().min(1),
  method: z.enum(['dns', 'file']),
});

export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type CreateVerification = z.infer<typeof createVerificationSchema>;
export type Verification = typeof verifications.$inferSelect;
