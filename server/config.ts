// Application configuration from environment variables
export const config = {
  // App settings
  appName: process.env.APP_NAME || 'Domain Verify',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Session
  sessionSecret: process.env.SESSION_SECRET,

  // OIDC Authentication
  oidc: {
    issuerUrl: process.env.OIDC_ISSUER_URL,
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    scope: process.env.OIDC_SCOPE || 'openid email profile',
  },

  // Branding
  branding: {
    primaryColor: process.env.BRAND_PRIMARY_COLOR || '#6366f1',
    accentColor: process.env.BRAND_ACCENT_COLOR || '#8b5cf6',
    companyName: process.env.COMPANY_NAME || 'Your Company',
    companyWebsite: process.env.COMPANY_WEBSITE || '',
    supportEmail: process.env.SUPPORT_EMAIL || '',
    logoUrl: process.env.LOGO_URL || '',
    logoDarkUrl: process.env.LOGO_DARK_URL || '',
  },

  // Features
  features: {
    enableWebhooks: process.env.ENABLE_WEBHOOKS !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  },
};

// Validation helper
export function validateConfig() {
  const required = [
    'DATABASE_URL',
    'SESSION_SECRET',
  ];

  // Check if Replit Auth is available (development or Replit deployment)
  const hasReplitAuth = !!(process.env.REPL_ID || process.env.ISSUER_URL);
  const hasOidcConfig = !!(process.env.OIDC_ISSUER_URL && process.env.OIDC_CLIENT_ID);

  // Only require OIDC config if:
  // 1. OIDC variables are partially set (must complete the setup)
  // 2. Production mode AND no Replit Auth available
  if (process.env.OIDC_ISSUER_URL || process.env.OIDC_CLIENT_ID) {
    // If any OIDC var is set, require all of them
    required.push('OIDC_ISSUER_URL', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'APP_URL');
  } else if (config.nodeEnv === 'production' && !hasReplitAuth) {
    // In production without Replit Auth, require OIDC
    required.push('OIDC_ISSUER_URL', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'APP_URL');
  }

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const authHelp = !hasReplitAuth && !hasOidcConfig 
      ? '\nNote: No authentication configured. Set OIDC_* variables or deploy on Replit for auth.'
      : '';
    
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check .env.example for required configuration.${authHelp}`
    );
  }
}
