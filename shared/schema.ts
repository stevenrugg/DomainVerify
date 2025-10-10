import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp,
  index,
  jsonb,
  boolean 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Organizations table
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// API Keys table
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  keyPrefix: text("key_prefix").notNull(), // For display purposes (first 7 chars)
  keySuffix: text("key_suffix").notNull(), // For display purposes (last 4 chars)
  isActive: boolean("is_active").notNull().default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// API Key with full key (only returned on creation)
export type ApiKeyWithKey = ApiKey & { key: string };

// Domain verifications table
export const verifications = pgTable("verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: 'cascade' }),
  domain: text("domain").notNull(),
  method: varchar("method", { length: 20 }).notNull(),
  token: text("token").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'),
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

// Webhooks table
export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  url: text("url").notNull(),
  events: text("events").array().notNull(), // ['verification.completed', 'verification.failed']
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

// Insert schemas for forms
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  organizationId: true,
  keyHash: true,
  keyPrefix: true,
  keySuffix: true,
  isActive: true,
  lastUsedAt: true,
  createdAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  organizationId: true,
  isActive: true,
  createdAt: true,
}).extend({
  url: z.string().url({ message: "Please enter a valid URL" }),
  events: z.array(z.string()).min(1, { message: "Select at least one event" }),
});
