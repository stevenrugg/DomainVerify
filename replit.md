# Domain Verification Platform

## Overview

A white-label SaaS platform for verifying domain ownership through DNS TXT records or HTML file uploads. The platform provides a RESTful API for domain verification services with secure authentication, multi-tenant organization management, and real-time webhook notifications. Built as a full-stack TypeScript application with React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Architecture

**Problem**: Need a unified type-safe codebase for domain verification platform  
**Solution**: Monorepo structure with shared TypeScript schemas  
**Key Decisions**:
- Single TypeScript configuration (`tsconfig.json`) covering client, server, and shared code
- Path aliases (`@/`, `@shared/`) for clean imports across the codebase
- ESM modules throughout for modern JavaScript practices
- Shared schema definitions via Drizzle ORM enable type safety between frontend and backend

**Pros**: Type safety across full stack, reduced duplication, easier refactoring  
**Cons**: Requires build tooling coordination, larger initial setup complexity

### Frontend Architecture

**Problem**: Need a responsive, theme-able UI for domain verification workflows  
**Solution**: React + Vite with shadcn/ui component system  
**Key Decisions**:
- Vite for fast development and optimized production builds
- React Router (wouter) for lightweight client-side routing
- TanStack Query for server state management and caching
- shadcn/ui components built on Radix UI primitives
- Tailwind CSS with custom theme system supporting dark/light modes
- CSS custom properties for white-label color theming

**Design System**:
- Custom color palette supporting both light and dark modes
- Inter font for UI, JetBrains Mono for code snippets
- Consistent spacing scale (2, 4, 6, 8, 12, 16 units)
- Card-based layouts with elevation effects on hover/active states

**Pros**: Fast development, accessible components, highly customizable theming  
**Cons**: Large component library increases bundle size

### Backend Architecture

**Problem**: Need flexible API server supporting authentication, verification, and webhooks  
**Solution**: Express.js REST API with session-based authentication  
**Key Decisions**:
- Express middleware pipeline for request processing
- Session storage in PostgreSQL for authentication state
- RESTful API design with `/api` namespace
- Separate routes for authenticated UI and public API endpoints
- Configuration-driven branding and feature flags via environment variables

**API Structure**:
- `/api/auth/*` - OIDC authentication endpoints
- `/api/organizations/*` - Multi-tenant organization management
- `/api/verifications/*` - Domain verification operations
- `/api/v1/*` - Public API requiring API key authentication
- `/api/config` - Client configuration endpoint for branding

**Pros**: Standard REST patterns, easy to understand and extend  
**Cons**: Session state requires database storage, scaling considerations

### Authentication System

**Problem**: Support multiple authentication providers for self-hosted deployments  
**Solution**: Flexible OIDC (OpenID Connect) authentication with fallback to Replit Auth  
**Key Decisions**:
- Generic OIDC support for production (Google, Auth0, Okta, Azure AD, etc.)
- Replit Auth integration for development environment
- Passport.js strategy pattern for provider abstraction
- Session-based authentication with PostgreSQL storage
- User profile data synced from OIDC provider claims

**Configuration Priority**:
1. Generic OIDC (if `OIDC_ISSUER_URL` and `OIDC_CLIENT_ID` set)
2. Replit Auth (if `REPL_ID` or `ISSUER_URL` set)
3. No authentication (logs warning)

**Pros**: Works with any OIDC provider, easy development on Replit  
**Cons**: Requires provider-specific configuration, session management overhead

### Multi-Tenant Architecture

**Problem**: Support multiple organizations with isolated data and API keys  
**Solution**: Organization-based data isolation with user ownership  
**Key Decisions**:
- Users can create and own multiple organizations
- API keys scoped to specific organizations
- Verifications and webhooks belong to organizations
- Foreign key constraints enforce data isolation
- User can switch between organizations in dashboard UI

**Data Model**:
- `users` - Authentication identity from OIDC provider
- `organizations` - Tenant containers owned by users
- `api_keys` - Scoped authentication tokens per organization
- `verifications` - Domain verification records per organization
- `webhooks` - Event notification endpoints per organization

**Pros**: Clean tenant isolation, flexible user-organization relationships  
**Cons**: Requires organization context in all API calls

### Database Layer

**Problem**: Need type-safe database access with schema migrations  
**Solution**: Drizzle ORM with PostgreSQL (via Neon serverless driver)  
**Key Decisions**:
- Drizzle ORM for type-safe queries and schema definitions
- Schema-first approach with TypeScript types generated from database schema
- Neon serverless driver for connection pooling and edge compatibility
- Zod schemas generated from Drizzle for runtime validation
- Migration management via `drizzle-kit push`

**Schema Design**:
- UUID primary keys (via `gen_random_uuid()`)
- Timestamps for audit trails (`created_at`, `updated_at`)
- Cascade deletes for data cleanup
- Indexed fields for query performance (e.g., session expiry)

**Pros**: Type safety, migrations as code, good developer experience  
**Cons**: Requires PostgreSQL, learning curve for Drizzle syntax

### API Key Security

**Problem**: Secure API key storage and validation for public API  
**Solution**: bcrypt hashing with prefix/suffix revelation pattern  
**Key Decisions**:
- API keys bcrypt-hashed before storage (never stored in plain text)
- Keys shown once at creation time only
- Key prefix (first 8 chars) and suffix (last 4 chars) stored for identification
- Last used timestamp tracking for security monitoring
- Bearer token authentication via `X-API-Key` header

**Key Format**: `dv_` prefix + random nanoid (e.g., `dv_abc123...xyz789`)

**Pros**: Industry-standard security, keys irrecoverable if database compromised  
**Cons**: Users must save keys immediately, no key recovery possible

### Domain Verification Methods

**Problem**: Verify domain ownership through multiple proof mechanisms  
**Solution**: Dual verification via DNS TXT records or HTML file upload  
**Key Decisions**:
- DNS verification checks for `_domainverify.<domain>` TXT record
- File verification checks for `https://<domain>/domain-verification.txt`
- Unique random tokens (nanoid) generated per verification attempt
- Asynchronous verification via manual trigger (not automatic polling)
- Status tracking: pending → verified/failed

**DNS Method**:
- Uses Node.js `dns.promises.resolveTxt()` to query records
- Checks for exact token match in TXT record values

**File Method**:
- HTTP fetch to well-known URL path
- Validates exact token match in response body

**Pros**: Standard verification methods, user choice, no external dependencies  
**Cons**: DNS propagation delays, HTTPS required for file method

### Webhook System

**Problem**: Notify external systems of verification events  
**Solution**: HTTP POST callbacks with event payloads  
**Key Decisions**:
- Webhooks configured per organization
- Event types: `verification.success`, `verification.failed`
- HTTP POST with JSON payload to configured URL
- Retry logic and failure tracking (implementation pending)
- Signature validation for security (implementation pending)

**Event Payload Structure**:
```json
{
  "event": "verification.success",
  "domain": "example.com",
  "verification_id": "...",
  "timestamp": "..."
}
```

**Pros**: Standard webhook pattern, extensible event types  
**Cons**: Webhook reliability depends on external endpoint availability

### White-Label Branding

**Problem**: Allow platform customization for different deployments  
**Solution**: Environment-based configuration with CSS custom properties  
**Key Decisions**:
- Branding configuration via environment variables
- App name, logo URLs, company info configurable
- Primary/accent colors injected as CSS custom properties
- Client receives branding config via `/api/config` endpoint
- React context provider applies branding on mount

**Configurable Elements**:
- Application name
- Logo (separate light/dark variants)
- Primary and accent colors (hex format, converted to HSL)
- Company name, website, support email
- Feature flags (webhooks, analytics)

**Pros**: Zero code changes for rebranding, theme consistency  
**Cons**: Limited to color/logo changes, no layout customization

## External Dependencies

### Core Infrastructure
- **PostgreSQL Database** - Primary data store for users, organizations, verifications, API keys, and sessions
- **Neon Serverless** - Serverless PostgreSQL driver for connection pooling and edge compatibility

### Authentication & Session Management
- **OIDC Provider** (Production) - Generic OpenID Connect provider (Google, Auth0, Okta, Azure AD, etc.) for user authentication
- **Replit Auth** (Development) - Authentication service for Replit development environment
- **Passport.js** - Authentication middleware with OIDC strategy
- **connect-pg-simple** - PostgreSQL session store for Express sessions

### Frontend Libraries
- **React** - UI framework
- **Vite** - Build tool and dev server
- **TanStack Query** - Server state management and caching
- **Radix UI** - Headless component primitives (@radix-ui/react-*)
- **shadcn/ui** - Pre-built accessible components
- **Tailwind CSS** - Utility-first CSS framework
- **wouter** - Lightweight client-side routing
- **React Hook Form** - Form state management with Zod validation
- **date-fns** - Date formatting utilities

### Backend Libraries
- **Express** - Web server framework
- **Drizzle ORM** - Type-safe database ORM
- **bcrypt** - Password/API key hashing
- **nanoid** - Unique ID generation for tokens
- **Zod** - Runtime schema validation

### Development Tools
- **TypeScript** - Type system for JavaScript
- **drizzle-kit** - Database migration tool
- **esbuild** - JavaScript bundler for server code
- **tsx** - TypeScript execution for development

### Optional External Services
- **Webhook Endpoints** - User-configured HTTPS endpoints for event notifications (if webhooks enabled)
- **DNS Servers** - Public DNS for TXT record verification queries
- **External Domains** - User domains being verified (for HTTPS file verification)