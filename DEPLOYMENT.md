# Deployment Guide

This guide explains how to deploy the Domain Verification Platform to various hosting environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Authentication Setup](#authentication-setup)
4. [Deployment Options](#deployment-options)
   - [Docker](#docker)
   - [Vercel](#vercel)
   - [Railway](#railway)
   - [Render](#render)
   - [AWS/GCP/Azure](#cloud-platforms)
5. [Database Setup](#database-setup)
6. [Production Checklist](#production-checklist)

## Prerequisites

- Node.js 18+ or Docker
- PostgreSQL database
- OIDC authentication provider (Google, Auth0, Okta, etc.)

## Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Required Variables

```env
# Application
APP_NAME="Your Brand Name"
APP_URL=https://your-domain.com
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Session
SESSION_SECRET=your-random-secret-key-here

# OIDC Authentication (choose one provider)
OIDC_ISSUER_URL=https://accounts.google.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_SCOPE=openid email profile
```

### Optional Branding Variables

```env
# Branding
BRAND_PRIMARY_COLOR=#6366f1
BRAND_ACCENT_COLOR=#8b5cf6
COMPANY_NAME="Your Company"
COMPANY_WEBSITE=https://your-company.com
SUPPORT_EMAIL=support@your-company.com
LOGO_URL=https://your-cdn.com/logo.png
LOGO_DARK_URL=https://your-cdn.com/logo-dark.png

# Features
ENABLE_WEBHOOKS=true
ENABLE_ANALYTICS=false
```

## Authentication Setup

The platform supports any OIDC-compatible provider. Here's how to set up popular ones:

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `https://your-domain.com/api/callback`
6. Copy Client ID and Client Secret

```env
OIDC_ISSUER_URL=https://accounts.google.com
OIDC_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
OIDC_CLIENT_SECRET=your-google-client-secret
OIDC_SCOPE=openid email profile
```

### Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create Application → Regular Web Application
3. Set Allowed Callback URLs: `https://your-domain.com/api/callback`
4. Set Allowed Logout URLs: `https://your-domain.com`
5. Copy Domain, Client ID, and Client Secret

```env
OIDC_ISSUER_URL=https://YOUR_DOMAIN.auth0.com/
OIDC_CLIENT_ID=your-auth0-client-id
OIDC_CLIENT_SECRET=your-auth0-client-secret
OIDC_SCOPE=openid email profile
```

### Okta

1. Go to [Okta Admin Console](https://your-domain.okta.com/admin)
2. Applications → Create App Integration → OIDC - Web Application
3. Set Sign-in redirect URIs: `https://your-domain.com/api/callback`
4. Copy Client ID and Client Secret

```env
OIDC_ISSUER_URL=https://YOUR_DOMAIN.okta.com/oauth2/default
OIDC_CLIENT_ID=your-okta-client-id
OIDC_CLIENT_SECRET=your-okta-client-secret
OIDC_SCOPE=openid email profile
```

### Azure AD

1. Go to [Azure Portal](https://portal.azure.com/)
2. Azure Active Directory → App registrations → New registration
3. Set Redirect URI: `https://your-domain.com/api/callback`
4. Certificates & secrets → New client secret
5. Copy Application (client) ID and secret value

```env
OIDC_ISSUER_URL=https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0
OIDC_CLIENT_ID=your-azure-client-id
OIDC_CLIENT_SECRET=your-azure-client-secret
OIDC_SCOPE=openid email profile
```

## Deployment Options

### Docker

1. **Create Dockerfile** (already included):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 5000
CMD ["node", "dist/server/index.js"]
```

2. **Build and run**:

```bash
docker build -t domain-verify .
docker run -p 5000:5000 --env-file .env domain-verify
```

3. **Docker Compose** (with PostgreSQL):

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/domainverify
      - APP_URL=https://your-domain.com
      - OIDC_ISSUER_URL=${OIDC_ISSUER_URL}
      - OIDC_CLIENT_ID=${OIDC_CLIENT_ID}
      - OIDC_CLIENT_SECRET=${OIDC_CLIENT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=domainverify
      - POSTGRES_PASSWORD=password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Vercel

1. **Install Vercel CLI**:

```bash
npm i -g vercel
```

2. **Create `vercel.json`**:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

3. **Deploy**:

```bash
vercel --prod
```

4. **Set environment variables** in Vercel dashboard

### Railway

1. **Create `railway.json`**:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

2. **Deploy via Railway CLI**:

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

3. **Add PostgreSQL**:

```bash
railway add postgresql
```

4. **Set environment variables** in Railway dashboard

### Render

1. **Create `render.yaml`**:

```yaml
services:
  - type: web
    name: domain-verify
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: domain-verify-db
          property: connectionString
      - key: APP_URL
        value: https://your-app.onrender.com
      - key: OIDC_ISSUER_URL
        sync: false
      - key: OIDC_CLIENT_ID
        sync: false
      - key: OIDC_CLIENT_SECRET
        sync: false
      - key: SESSION_SECRET
        generateValue: true

databases:
  - name: domain-verify-db
    databaseName: domainverify
    user: domainverify
```

2. **Deploy**:

- Connect your GitHub repo
- Or use Render CLI: `render deploy`

### Cloud Platforms (AWS/GCP/Azure)

#### AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js domain-verify

# Create environment
eb create domain-verify-prod

# Set environment variables
eb setenv APP_URL=https://your-app.elasticbeanstalk.com \
  OIDC_ISSUER_URL=... \
  OIDC_CLIENT_ID=... \
  OIDC_CLIENT_SECRET=... \
  DATABASE_URL=...

# Deploy
eb deploy
```

#### GCP (Cloud Run)

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/domain-verify

# Deploy
gcloud run deploy domain-verify \
  --image gcr.io/PROJECT_ID/domain-verify \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars APP_URL=https://your-app.run.app,OIDC_ISSUER_URL=...,OIDC_CLIENT_ID=...,OIDC_CLIENT_SECRET=...,DATABASE_URL=...,SESSION_SECRET=...
```

#### Azure (App Service)

```bash
# Create resource group
az group create --name domain-verify-rg --location eastus

# Create App Service plan
az appservice plan create --name domain-verify-plan --resource-group domain-verify-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group domain-verify-rg --plan domain-verify-plan --name domain-verify --runtime "NODE|20-lts"

# Set environment variables
az webapp config appsettings set --resource-group domain-verify-rg --name domain-verify --settings \
  APP_URL=https://domain-verify.azurewebsites.net \
  OIDC_ISSUER_URL=... \
  OIDC_CLIENT_ID=... \
  OIDC_CLIENT_SECRET=... \
  DATABASE_URL=... \
  SESSION_SECRET=...

# Deploy
az webapp deployment source config-zip --resource-group domain-verify-rg --name domain-verify --src ./dist.zip
```

## Database Setup

### Using Managed PostgreSQL

Most cloud providers offer managed PostgreSQL:

- **AWS**: RDS for PostgreSQL
- **GCP**: Cloud SQL for PostgreSQL
- **Azure**: Azure Database for PostgreSQL
- **Render**: Managed PostgreSQL
- **Railway**: Managed PostgreSQL
- **Neon**: Serverless PostgreSQL (recommended)

### Database Migrations

1. **Create database tables**:

```bash
npm run db:push
```

2. **Or force push** (if needed):

```bash
npm run db:push --force
```

The schema includes:
- `users` - User accounts
- `organizations` - Customer organizations
- `api_keys` - Hashed API keys
- `verifications` - Domain verifications
- `webhooks` - Webhook endpoints
- `sessions` - User sessions

## Production Checklist

### Security

- [ ] Set strong `SESSION_SECRET` (32+ random characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS if needed
- [ ] Set secure cookie settings
- [ ] Review API rate limiting
- [ ] Enable database SSL connections
- [ ] Rotate secrets regularly

### Performance

- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Enable gzip compression
- [ ] Set up caching (Redis/Memcached)
- [ ] Configure auto-scaling

### Monitoring

- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure logging (Winston, Pino)
- [ ] Add uptime monitoring
- [ ] Set up alerts
- [ ] Monitor database performance

### Backup & Recovery

- [ ] Automated database backups
- [ ] Test restore procedures
- [ ] Document recovery process
- [ ] Version control configurations

### DNS Configuration

For domain verification to work:

1. Ensure your domain has proper A/AAAA records
2. Configure DNS TXT record verification if needed
3. Set up SSL certificate for HTTPS

## Troubleshooting

### Authentication Issues

```bash
# Check OIDC configuration
curl https://YOUR_ISSUER_URL/.well-known/openid-configuration

# Verify redirect URI matches exactly
# Must match: https://your-domain.com/api/callback
```

### Database Connection

```bash
# Test connection
psql $DATABASE_URL

# Check tables
npm run db:push
```

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Support

For deployment help:
- Check logs: `npm run logs`
- Database issues: `npm run db:studio`
- Environment variables: Review `.env.example`

## License

MIT License - Customize and deploy anywhere!