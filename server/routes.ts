import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { createVerificationSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { z } from "zod";
import { config } from "./config";

// DNS verification helper
async function checkDNSVerification(domain: string, token: string): Promise<boolean> {
  try {
    const dns = await import('dns').then(m => m.promises);
    const records = await dns.resolveTxt(`_domainverify.${domain}`);
    
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

// API Key authentication middleware
export const requireApiKey: RequestHandler = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const key = await storage.validateApiKey(apiKey);

  if (!key) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Update last used timestamp
  await storage.updateApiKeyLastUsed(key.id);

  // Attach organization to request
  (req as any).organizationId = key.organizationId;
  next();
};

// Trigger webhook for verification events
async function triggerWebhooks(organizationId: string, event: string, data: any) {
  const webhooks = await storage.getOrganizationWebhooks(organizationId);
  
  for (const webhook of webhooks) {
    if (!webhook.isActive || !webhook.events.includes(event)) {
      continue;
    }

    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Webhook error for ${webhook.url}:`, error);
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Public configuration endpoint (branding, etc)
  app.get('/api/config', (req, res) => {
    // Only include branding fields that are actually set
    const branding: any = {
      primaryColor: config.branding.primaryColor,
      accentColor: config.branding.accentColor,
      companyName: config.branding.companyName,
    };

    // Only include URLs if they're set (avoid broken image tags)
    if (config.branding.companyWebsite) {
      branding.companyWebsite = config.branding.companyWebsite;
    }
    if (config.branding.supportEmail) {
      branding.supportEmail = config.branding.supportEmail;
    }
    if (config.branding.logoUrl) {
      branding.logoUrl = config.branding.logoUrl;
    }
    if (config.branding.logoDarkUrl) {
      branding.logoDarkUrl = config.branding.logoDarkUrl;
    }

    res.json({
      appName: config.appName,
      branding,
      features: config.features,
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;

      const updateSchema = z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
      });

      const validated = updateSchema.parse({ firstName, lastName });
      const updatedUser = await storage.updateUser(userId, validated);
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Account deletion
  app.delete('/api/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Organization routes
  app.post("/api/organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name } = req.body;

      const organization = await storage.createOrganization({
        userId,
        name,
      });

      res.json(organization);
    } catch (error) {
      console.error('Failed to create organization:', error);
      res.status(500).json({ error: 'Failed to create organization' });
    }
  });

  app.get("/api/organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizations = await storage.getUserOrganizations(userId);
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  });

  // API Key routes (authenticated)
  app.post("/api/organizations/:orgId/api-keys", isAuthenticated, async (req: any, res) => {
    try {
      const { orgId } = req.params;
      const { name } = req.body;
      const userId = req.user.claims.sub;

      // Verify user owns this organization
      const org = await storage.getOrganization(orgId);
      if (!org || org.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const key = `dvk_${nanoid(32)}`;
      const apiKey = await storage.createApiKey({
        organizationId: orgId,
        name,
        key,
      });

      res.json(apiKey);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create API key' });
    }
  });

  app.get("/api/organizations/:orgId/api-keys", isAuthenticated, async (req: any, res) => {
    try {
      const { orgId } = req.params;
      const userId = req.user.claims.sub;

      const org = await storage.getOrganization(orgId);
      if (!org || org.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const apiKeys = await storage.getOrganizationApiKeys(orgId);
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  });

  app.delete("/api/api-keys/:keyId", isAuthenticated, async (req: any, res) => {
    try {
      const { keyId } = req.params;
      const userId = req.user.claims.sub;

      // Get the API key to find its organization
      const apiKey = await storage.getApiKey(keyId);
      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }

      // Verify the user owns the organization
      const org = await storage.getOrganization(apiKey.organizationId);
      if (!org || org.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await storage.deleteApiKey(keyId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete API key' });
    }
  });

  // Webhook routes
  app.post("/api/organizations/:orgId/webhooks", isAuthenticated, async (req: any, res) => {
    try {
      const { orgId } = req.params;
      const { url, events } = req.body;
      const userId = req.user.claims.sub;

      const org = await storage.getOrganization(orgId);
      if (!org || org.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const webhook = await storage.createWebhook({
        organizationId: orgId,
        url,
        events,
      });

      res.json(webhook);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create webhook' });
    }
  });

  app.get("/api/organizations/:orgId/webhooks", isAuthenticated, async (req: any, res) => {
    try {
      const { orgId } = req.params;
      const userId = req.user.claims.sub;

      const org = await storage.getOrganization(orgId);
      if (!org || org.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const webhooks = await storage.getOrganizationWebhooks(orgId);
      res.json(webhooks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
  });

  // Public API endpoints (require API key)
  app.post("/api/v1/verifications", requireApiKey, async (req: any, res) => {
    try {
      const { domain, method } = createVerificationSchema.parse(req.body);
      const organizationId = req.organizationId;
      
      const token = `verify-domain-${nanoid(20)}`;
      
      const verification = await storage.createVerification({
        organizationId,
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

  app.post("/api/v1/verifications/:id/check", requireApiKey, async (req: any, res) => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId;
      const verification = await storage.getVerification(id);

      if (!verification || verification.organizationId !== organizationId) {
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

      // Trigger webhooks
      if (updated && organizationId) {
        const event = isVerified ? 'verification.completed' : 'verification.failed';
        await triggerWebhooks(organizationId, event, updated);
      }

      res.json(updated);
    } catch (error) {
      console.error('Verification check error:', error);
      res.status(500).json({ error: 'Failed to check verification' });
    }
  });

  app.get("/api/v1/verifications", requireApiKey, async (req: any, res) => {
    try {
      const organizationId = req.organizationId;
      const verifications = await storage.getOrganizationVerifications(organizationId);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch verifications' });
    }
  });

  // Dashboard routes (authenticated, for UI)
  app.get("/api/dashboard/verifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizations = await storage.getUserOrganizations(userId);
      
      if (organizations.length === 0) {
        return res.json([]);
      }

      // Get verifications for all user's organizations
      const allVerifications = await Promise.all(
        organizations.map(org => storage.getOrganizationVerifications(org.id))
      );

      const verifications = allVerifications.flat();
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch verifications' });
    }
  });

  // Session-based verification endpoints (for authenticated users)
  app.post("/api/verifications", isAuthenticated, async (req: any, res) => {
    try {
      const { domain, method } = createVerificationSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Get or create default organization for user
      let organizations = await storage.getUserOrganizations(userId);
      let organizationId: string;
      
      if (organizations.length === 0) {
        // Create a default organization for the user
        const org = await storage.createOrganization({
          userId,
          name: "Default Organization",
        });
        organizationId = org.id;
      } else {
        organizationId = organizations[0].id;
      }
      
      const token = `verify-domain-${nanoid(20)}`;
      
      const verification = await storage.createVerification({
        organizationId,
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
        console.error('Failed to create verification:', error);
        res.status(500).json({ error: 'Failed to create verification' });
      }
    }
  });

  app.get("/api/verifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizations = await storage.getUserOrganizations(userId);
      
      if (organizations.length === 0) {
        return res.json([]);
      }

      // Get verifications for all user's organizations
      const allVerifications = await Promise.all(
        organizations.map(org => storage.getOrganizationVerifications(org.id))
      );

      const verifications = allVerifications.flat();
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch verifications' });
    }
  });

  app.post("/api/verifications/:id/check", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Get the verification and ensure user owns it
      const verification = await storage.getVerification(id);
      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }
      
      // Check if user owns the organization
      if (verification.organizationId) {
        const org = await storage.getOrganization(verification.organizationId);
        if (!org || org.userId !== userId) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

      const { domain, method, token } = verification;
      let isVerified = false;

      if (method === 'dns') {
        isVerified = await checkDNSVerification(domain, token);
      } else if (method === 'file') {
        isVerified = await checkFileVerification(domain, token);
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

  const httpServer = createServer(app);

  return httpServer;
}
