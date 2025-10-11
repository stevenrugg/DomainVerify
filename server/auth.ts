// Flexible OIDC Authentication System
// Supports: Replit Auth (development), Generic OIDC (production/self-hosted)
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { config } from "./config";

// Detect authentication mode - Generic OIDC takes precedence
const isGenericOidc = !!(process.env.OIDC_ISSUER_URL && process.env.OIDC_CLIENT_ID);
const isReplitAuth = !isGenericOidc && !!(process.env.ISSUER_URL || process.env.REPL_ID);

if (!isReplitAuth && !isGenericOidc) {
  console.warn('⚠️  No authentication configured. Set either:');
  console.warn('   - OIDC_ISSUER_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET (for generic OIDC)');
  console.warn('   - ISSUER_URL, REPL_ID (for Replit Auth)');
}

if (isGenericOidc) {
  console.log('🔐 Using generic OIDC authentication');
} else if (isReplitAuth) {
  console.log('🔐 Using Replit Auth authentication');
}

const getOidcConfig = memoize(
  async () => {
    if (isReplitAuth) {
      // Replit Auth mode (for development on Replit)
      return await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!
      );
    } else {
      // Generic OIDC mode (for production/self-hosted)
      return await client.discovery(
        new URL(process.env.OIDC_ISSUER_URL!),
        process.env.OIDC_CLIENT_ID!,
        {
          client_secret: process.env.OIDC_CLIENT_SECRET!,
        }
      );
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  // Map OIDC standard claims to user fields
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"] || claims["preferred_username"],
    firstName: claims["given_name"] || claims["first_name"] || claims["name"]?.split(' ')[0],
    lastName: claims["family_name"] || claims["last_name"] || claims["name"]?.split(' ').slice(1).join(' '),
    profileImageUrl: claims["picture"] || claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const oidcConfig = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  if (isReplitAuth) {
    // Replit Auth mode - support multiple domains
    const domains = (process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || 'localhost:5000').split(',');
    
    for (const domain of domains) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config: oidcConfig,
          scope: 'openid email profile offline_access',
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
    }

    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(oidcConfig, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  } else {
    // Generic OIDC mode - for self-hosted deployments
    const appUrl = process.env.APP_URL || config.appUrl;
    const callbackUrl = `${appUrl}/api/callback`;

    const strategy = new Strategy(
      {
        name: 'oidc',
        config: oidcConfig,
        scope: process.env.OIDC_SCOPE || 'openid email profile',
        callbackURL: callbackUrl,
      },
      verify
    );
    
    passport.use(strategy);

    app.get("/api/login", (req, res, next) => {
      passport.authenticate('oidc', {
        prompt: "login consent",
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate('oidc', {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        const logoutUrl = client.buildEndSessionUrl(oidcConfig, {
          client_id: process.env.OIDC_CLIENT_ID!,
          post_logout_redirect_uri: appUrl,
        }).href;
        res.redirect(logoutUrl);
      });
    });
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
