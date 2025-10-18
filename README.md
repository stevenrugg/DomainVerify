# Domain Verification Platform 🔐

A white-label SaaS platform for domain verification through DNS TXT records or HTML file uploads. Built with TypeScript, React, Express, and PostgreSQL.

## ✨ Features

- **🔑 Secure API Key Management** - Bcrypt-hashed keys, visible only once at creation
- **🌐 Dual Verification Methods** - DNS TXT records and HTML file upload
- **🎨 White-Label Ready** - Fully customizable branding and configuration
- **🔔 Webhook Support** - Real-time event notifications
- **📊 Organization Management** - Multi-tenant architecture
- **🚀 Portable** - Deploy anywhere with Docker or cloud platforms
- **🔐 Flexible Authentication** - Works with any OIDC provider (Google, Auth0, Okta, Azure AD, etc.)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd domain-verification-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run database migrations**

```bash
npm run db:push
```

5. **Start development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Docker Deployment

```bash
# Using Docker Compose (includes PostgreSQL)
docker-compose up -d

# Or build and run standalone
docker build -t domain-verify .
docker run -p 5000:5000 --env-file .env domain-verify
```

## 📋 Configuration

### Required Environment Variables

```env
# Application
APP_NAME="Your Brand Name"
APP_URL=https://your-domain.com
SESSION_SECRET=your-random-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OIDC Authentication (any provider)
OIDC_ISSUER_URL=https://accounts.google.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
```

### Optional Branding

```env
# Customize colors, logos, and company info
BRAND_PRIMARY_COLOR=#6366f1
BRAND_ACCENT_COLOR=#8b5cf6
COMPANY_NAME="Your Company"
LOGO_URL=https://your-cdn.com/logo.png
LOGO_DARK_URL=https://your-cdn.com/logo-dark.png
```

See `.env.example` for all available options.

## 🔐 Authentication Setup

The platform supports any OIDC-compatible authentication provider:

### Google OAuth

1. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Set redirect URI: `https://your-domain.com/api/callback`
3. Configure:

```env
OIDC_ISSUER_URL=https://accounts.google.com
OIDC_CLIENT_ID=your-id.apps.googleusercontent.com
OIDC_CLIENT_SECRET=your-secret
```

### Auth0

1. Create a Regular Web Application in [Auth0](https://manage.auth0.com/)
2. Set callback URL: `https://your-domain.com/api/callback`
3. Configure:

```env
OIDC_ISSUER_URL=https://YOUR_DOMAIN.auth0.com/
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Okta, Azure AD, and other providers.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with OIDC strategy
- **Deployment**: Docker, Vercel, Railway, Render, AWS, GCP, Azure

### Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication
│   ├── storage.ts       # Data layer
│   └── config.ts        # Configuration
├── shared/              # Shared types
│   └── schema.ts        # Database schema
└── Dockerfile           # Docker configuration
```

## 📚 API Documentation

### Authentication

All API requests require an API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" https://your-api.com/api/v1/verifications
```

### Endpoints

#### Create Verification

```bash
POST /api/v1/verifications
Content-Type: application/json

{
  "domain": "example.com",
  "method": "dns" | "file"
}
```

#### Check Verification

```bash
POST /api/v1/verifications/{id}/check
```

#### List Verifications

```bash
GET /api/v1/verifications
```

### Webhooks

Configure webhooks to receive real-time verification events:

```json
{
  "event": "verification.completed",
  "data": {
    "id": "...",
    "domain": "example.com",
    "status": "verified"
  }
}
```

## 🚀 Deployment

### Platform Options

- **Docker** - Containerized deployment with docker-compose
- **Vercel** - Serverless deployment (see [DEPLOYMENT.md](./DEPLOYMENT.md))
- **Railway** - One-click deploy with managed PostgreSQL
- **Render** - Auto-deploy from Git with managed database
- **AWS/GCP/Azure** - Enterprise cloud deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed platform-specific instructions.

### Production Checklist

- [ ] Set strong `SESSION_SECRET` (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure managed PostgreSQL
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging and monitoring
- [ ] Set up automated backups
- [ ] Test domain verification functionality

## 🔒 Security

- API keys hashed with bcrypt (10 rounds)
- Keys shown only once at creation
- Session management with PostgreSQL store
- HTTPS-only cookies in production
- OIDC authentication flow
- Organization-level isolation

## 📈 Database Schema

Core tables:
- `users` - User accounts with OIDC claims
- `organizations` - Customer organizations
- `api_keys` - Hashed API keys with prefix/suffix
- `verifications` - Domain verification records
- `webhooks` - Webhook endpoints per organization
- `sessions` - User session storage

Run migrations:

```bash
npm run db:push          # Apply schema changes
npm run db:push --force  # Force sync (use carefully)
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run db:push      # Push schema to database
```

### Code Style

- TypeScript for type safety
- React hooks and functional components
- TailwindCSS for styling
- shadcn/ui component library

## 📄 License

MIT License - Feel free to customize and deploy anywhere!

## 🤝 Support

- Documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Issues: Create an issue in this repository
- Email: Configure via `SUPPORT_EMAIL` environment variable

---

Built with ❤️ for developers who need reliable domain verification.
