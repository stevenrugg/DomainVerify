# Domain Verification Platform

## Overview

A white-label SaaS platform for verifying domain ownership through DNS TXT records or HTML file uploads. Built as a portable, deployable-anywhere solution with full branding customization. The platform provides a trustworthy interface with secure API key management, webhook support, and multi-tenant organization architecture. Built with a full-stack TypeScript architecture using React, Express, and PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 11, 2025)

### White-Label & Portability Implementation (Latest)
- **Flexible Authentication**: Hybrid auth system supporting both Replit Auth (development) and generic OIDC (production)
  - Works with Google, Auth0, Okta, Azure AD, Keycloak, and any OIDC provider
  - Auto-detects authentication mode (OIDC takes precedence when configured)
  - Maps standard OIDC claims to user fields
  - Validates configuration on startup with fail-fast error handling
- **Branding Configuration**:
  - Added `/api/config` endpoint exposing customizable branding
  - Environment-based configuration (APP_NAME, colors, logos, company info)
  - Frontend hook `useConfig()` for accessing branding
  - Header component uses configurable app name and logos
  - Supports light/dark mode logos
  - **Dynamic Theme System**: BrandingProvider applies brand colors to CSS variables
    - Converts hex colors to HSL format for CSS custom properties
    - Primary color updates `--primary`, `--sidebar-primary`, `--ring`, `--sidebar-ring`
    - Gracefully handles missing branding fields (omits empty URLs)
- **Deployment Ready**:
  - Created comprehensive DEPLOYMENT.md with guides for Docker, Vercel, Railway, Render, AWS, GCP, Azure
  - Dockerfile with multi-stage build for optimal image size
  - docker-compose.yml with PostgreSQL for local/production deployment
  - .dockerignore for optimized builds
  - .env.example with all configuration options
- **Configuration System**: Centralized config module with validation and defaults
- **Documentation**: README.md and deployment guides for hosting anywhere

## Recent Changes (October 10, 2025)

### API Key Security Implementation (Latest)
- **Secure Storage**: API keys now hashed with bcrypt (10 rounds) before storage
- **Database Schema**: Changed from plain 'key' field to 'keyHash', 'keyPrefix', 'keySuffix'
- **Single Exposure**: Keys only visible once during creation, never retrievable afterward
- **Masked Display**: UI shows prefix...suffix format with "(hidden for security)" indicator
- **Authorization Fix**: DELETE endpoint now verifies organization ownership (prevents privilege escalation)
- **Authentication**: API key validation uses bcrypt.compare() against stored hashes

### Domain Verification Platform (Previous)
- Implemented complete domain verification flow with DNS and file upload methods
- Created backend API routes for verification creation and status checking
- Connected frontend to backend with proper React Query integration
- Added DNS TXT record verification using Node.js DNS promises
- Added HTTP file verification for domain-verification.txt files
- Implemented verification history tracking and display
- All features fully tested and working

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server with HMR (Hot Module Replacement)
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Framework & Design System**
- shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Dark mode support with theme toggle functionality
- Design inspiration from Plaid's verification flows emphasizing trust and clarity

**State Management**
- TanStack Query (React Query) for server state management
- Local React state for UI interactions
- Custom hooks for reusable logic (mobile detection, toast notifications)

**Key Design Decisions**
- Component-based architecture with reusable UI primitives
- Step-based wizard interface for domain verification flow
- Real-time verification status tracking
- Responsive design with mobile-first approach
- Accessibility through Radix UI primitives

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript with ESM modules
- Development mode integrates Vite middleware for seamless HMR

**API Design**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- Error handling middleware with standardized error responses
- Request logging for debugging (truncated to 80 characters)

**Domain Verification Logic**
- DNS verification: Checks for TXT record at `_domainverify.{domain}` subdomain using Node.js DNS promises API
- File verification: Fetches `https://{domain}/domain-verification.txt` and validates token match
- Token generation using nanoid for unique verification tokens
- Asynchronous verification with status tracking (pending, verified, failed)

**Key Design Decisions**
- Separation of verification methods (DNS vs. file upload) for flexibility
- Helper functions for DNS and HTTP-based verification checks
- Express middleware pattern for request processing and error handling
- In-development Vite integration for unified development experience

### Data Layer

**ORM & Database**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the database (using Neon serverless driver)
- Schema defined in TypeScript with automatic type inference

**Database Schema**

*Users Table*
- `id`: UUID primary key (auto-generated)
- `username`: Unique text field
- `password`: Text field for authentication

*Verifications Table*
- `id`: UUID primary key (auto-generated)
- `domain`: Text field for domain name
- `method`: Enum ('dns' or 'file')
- `token`: Text field for verification token
- `status`: Enum ('pending', 'verified', 'failed')
- `verifiedAt`: Timestamp (nullable)
- `createdAt`: Timestamp with default now()

**Storage Layer**
- Interface-based storage design (`IStorage`) for abstraction
- In-memory storage implementation (`MemStorage`) for development/testing
- Prepared for database-backed storage implementation
- CRUD operations for users and verifications

**Schema Validation**
- Zod for runtime type validation
- Drizzle-Zod integration for schema-based validators
- Separate schemas for inserts vs. selects

### External Dependencies

**Core Infrastructure**
- **Neon Database**: PostgreSQL serverless database provider
- **Drizzle Kit**: Database migration tooling

**UI & Styling**
- **Google Fonts**: Inter (primary) and JetBrains Mono (code blocks)
- **Radix UI**: Unstyled, accessible component primitives (20+ components)
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework with PostCSS

**Development Tools**
- **Replit Plugins**: Runtime error modal, cartographer, dev banner (development only)
- **tsx**: TypeScript execution for development server
- **esbuild**: Production build bundler

**Libraries**
- **date-fns**: Date formatting and manipulation
- **nanoid**: Unique ID generation for tokens
- **react-hook-form**: Form state management with Zod resolvers
- **cmdk**: Command palette component
- **embla-carousel**: Carousel component
- **vaul**: Drawer component
- **class-variance-authority**: Component variant utilities
- **clsx** / **tailwind-merge**: Conditional class composition

**Session Management**
- **connect-pg-simple**: PostgreSQL session store (prepared for authentication)