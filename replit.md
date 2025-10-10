# Domain Verification Platform

## Overview

A web application for verifying domain ownership through DNS TXT records or HTML file uploads. The platform provides a trustworthy, Plaid-inspired interface that guides users through the verification process with clear progress tracking and status updates. Built with a full-stack TypeScript architecture using React, Express, and in-memory storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 10, 2025)

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