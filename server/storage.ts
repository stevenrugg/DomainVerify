import { type User, type InsertUser, type Verification, type InsertVerification } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Verification methods
  createVerification(verification: InsertVerification): Promise<Verification>;
  getVerification(id: string): Promise<Verification | undefined>;
  getVerificationsByDomain(domain: string): Promise<Verification[]>;
  getAllVerifications(): Promise<Verification[]>;
  updateVerificationStatus(id: string, status: 'verified' | 'failed', verifiedAt?: Date): Promise<Verification | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private verifications: Map<string, Verification>;

  constructor() {
    this.users = new Map();
    this.verifications = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createVerification(insertVerification: InsertVerification): Promise<Verification> {
    const id = randomUUID();
    const verification: Verification = {
      id,
      domain: insertVerification.domain,
      method: insertVerification.method,
      token: insertVerification.token,
      status: insertVerification.status || 'pending',
      createdAt: new Date(),
      verifiedAt: null,
    };
    this.verifications.set(id, verification);
    return verification;
  }

  async getVerification(id: string): Promise<Verification | undefined> {
    return this.verifications.get(id);
  }

  async getVerificationsByDomain(domain: string): Promise<Verification[]> {
    return Array.from(this.verifications.values()).filter(
      (v) => v.domain === domain
    );
  }

  async getAllVerifications(): Promise<Verification[]> {
    return Array.from(this.verifications.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateVerificationStatus(
    id: string,
    status: 'verified' | 'failed',
    verifiedAt?: Date
  ): Promise<Verification | undefined> {
    const verification = this.verifications.get(id);
    if (!verification) return undefined;

    const updated = {
      ...verification,
      status,
      verifiedAt: status === 'verified' ? (verifiedAt || new Date()) : null,
    };
    this.verifications.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
