import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createVerificationSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { z } from "zod";

// DNS verification helper
async function checkDNSVerification(domain: string, token: string): Promise<boolean> {
  try {
    const dns = await import('dns').then(m => m.promises);
    const records = await dns.resolveTxt(`_domainverify.${domain}`);
    
    // Check if any TXT record matches our token
    for (const record of records) {
      const value = Array.isArray(record) ? record.join('') : record;
      if (value === token) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('DNS verification error:', error);
    return false;
  }
}

// File verification helper
async function checkFileVerification(domain: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}/domain-verification.txt`, {
      method: 'GET',
      headers: {
        'User-Agent': 'DomainVerify/1.0',
      },
    });

    if (!response.ok) {
      return false;
    }

    const content = await response.text();
    return content.trim() === token.trim();
  } catch (error) {
    console.error('File verification error:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new verification
  app.post("/api/verifications", async (req, res) => {
    try {
      const { domain, method } = createVerificationSchema.parse(req.body);
      
      // Generate a unique token
      const token = `verify-domain-${nanoid(20)}`;
      
      const verification = await storage.createVerification({
        domain,
        method,
        token,
        status: 'pending',
      });

      res.json(verification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create verification' });
      }
    }
  });

  // Check verification status
  app.post("/api/verifications/:id/check", async (req, res) => {
    try {
      const { id } = req.params;
      const verification = await storage.getVerification(id);

      if (!verification) {
        res.status(404).json({ error: 'Verification not found' });
        return;
      }

      if (verification.status === 'verified') {
        res.json(verification);
        return;
      }

      let isVerified = false;

      if (verification.method === 'dns') {
        isVerified = await checkDNSVerification(verification.domain, verification.token);
      } else if (verification.method === 'file') {
        isVerified = await checkFileVerification(verification.domain, verification.token);
      }

      const status = isVerified ? 'verified' : 'failed';
      const updated = await storage.updateVerificationStatus(
        id,
        status,
        isVerified ? new Date() : undefined
      );

      res.json(updated);
    } catch (error) {
      console.error('Verification check error:', error);
      res.status(500).json({ error: 'Failed to check verification' });
    }
  });

  // Get all verifications
  app.get("/api/verifications", async (req, res) => {
    try {
      const verifications = await storage.getAllVerifications();
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch verifications' });
    }
  });

  // Get single verification
  app.get("/api/verifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const verification = await storage.getVerification(id);

      if (!verification) {
        res.status(404).json({ error: 'Verification not found' });
        return;
      }

      res.json(verification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch verification' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
