// Integration reference: blueprint:javascript_log_in_with_replit
import {
  users,
  organizations,
  apiKeys,
  verifications,
  webhooks,
  type User,
  type UpsertUser,
  type Organization,
  type InsertOrganization,
  type ApiKey,
  type ApiKeyWithKey,
  type InsertApiKey,
  type Verification,
  type InsertVerification,
  type Webhook,
  type InsertWebhook,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Organization operations
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  
  // API Key operations
  createApiKey(apiKey: Omit<InsertApiKey, 'keyHash' | 'keyPrefix' | 'keySuffix'> & { key: string }): Promise<ApiKeyWithKey>;
  validateApiKey(key: string): Promise<ApiKey | undefined>;
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getOrganizationApiKeys(organizationId: string): Promise<ApiKey[]>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  deleteApiKey(id: string): Promise<void>;
  
  // Verification operations
  createVerification(verification: InsertVerification): Promise<Verification>;
  getVerification(id: string): Promise<Verification | undefined>;
  getOrganizationVerifications(organizationId: string): Promise<Verification[]>;
  getAllVerifications(): Promise<Verification[]>;
  updateVerificationStatus(id: string, status: 'verified' | 'failed', verifiedAt?: Date): Promise<Verification | undefined>;
  
  // Webhook operations
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  getOrganizationWebhooks(organizationId: string): Promise<Webhook[]>;
  deleteWebhook(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
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

  // Organization operations
  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(orgData).returning();
    return org;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    return await db.select().from(organizations).where(eq(organizations.userId, userId));
  }

  // API Key operations
  async createApiKey(apiKeyData: Omit<InsertApiKey, 'keyHash' | 'keyPrefix' | 'keySuffix'> & { key: string }): Promise<ApiKeyWithKey> {
    const { key, ...rest } = apiKeyData;
    
    // Hash the API key
    const keyHash = await bcrypt.hash(key, 10);
    
    // Extract prefix and suffix for display
    const keyPrefix = key.substring(0, 7);
    const keySuffix = key.substring(key.length - 4);
    
    const [apiKey] = await db.insert(apiKeys).values({
      ...rest,
      keyHash,
      keyPrefix,
      keySuffix,
    }).returning();
    
    // Return with the full key only on creation
    return { ...apiKey, key };
  }

  async validateApiKey(key: string): Promise<ApiKey | undefined> {
    // Get all active API keys
    const allKeys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.isActive, true));
    
    // Check each key's hash
    for (const apiKey of allKeys) {
      const isValid = await bcrypt.compare(key, apiKey.keyHash);
      if (isValid) {
        return apiKey;
      }
    }
    
    return undefined;
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id));
    return apiKey;
  }

  async getOrganizationApiKeys(organizationId: string): Promise<ApiKey[]> {
    return await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.organizationId, organizationId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }

  async deleteApiKey(id: string): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  // Verification operations
  async createVerification(verificationData: InsertVerification): Promise<Verification> {
    const [verification] = await db
      .insert(verifications)
      .values(verificationData)
      .returning();
    return verification;
  }

  async getVerification(id: string): Promise<Verification | undefined> {
    const [verification] = await db
      .select()
      .from(verifications)
      .where(eq(verifications.id, id));
    return verification;
  }

  async getOrganizationVerifications(organizationId: string): Promise<Verification[]> {
    return await db
      .select()
      .from(verifications)
      .where(eq(verifications.organizationId, organizationId))
      .orderBy(desc(verifications.createdAt));
  }

  async getAllVerifications(): Promise<Verification[]> {
    return await db
      .select()
      .from(verifications)
      .orderBy(desc(verifications.createdAt));
  }

  async updateVerificationStatus(
    id: string,
    status: 'verified' | 'failed',
    verifiedAt?: Date
  ): Promise<Verification | undefined> {
    const [verification] = await db
      .update(verifications)
      .set({
        status,
        verifiedAt: status === 'verified' ? (verifiedAt || new Date()) : null,
      })
      .where(eq(verifications.id, id))
      .returning();
    return verification;
  }

  // Webhook operations
  async createWebhook(webhookData: InsertWebhook): Promise<Webhook> {
    const [webhook] = await db.insert(webhooks).values(webhookData).returning();
    return webhook;
  }

  async getOrganizationWebhooks(organizationId: string): Promise<Webhook[]> {
    return await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.organizationId, organizationId));
  }

  async deleteWebhook(id: string): Promise<void> {
    await db.delete(webhooks).where(eq(webhooks.id, id));
  }
}

export const storage = new DatabaseStorage();
