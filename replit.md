# Educational Travel Quote Generator

## Overview

This is a full-stack web application for generating professional travel quotes for educational institutions. The system allows users to create detailed travel quotes for school trips, including destinations, pricing, and additional services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Style**: RESTful API
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema Validation**: Zod for runtime type checking

### Project Structure
- `/client` - React frontend application
- `/server` - Express.js backend
- `/shared` - Shared TypeScript types and schemas
- UI components follow the shadcn/ui pattern in `/client/src/components/ui`

## Key Components

### Database Schema
- **quotes table**: Stores educational travel quotes with fields for:
  - Trip details (destination, dates, duration, trip type)
  - Group size (students and teachers)
  - School information (name, contact, address)
  - Pricing (per-student cost, teacher discounts)
  - Additional services (insurance, transfers, transport, tour guide)
  - Quote metadata (quote number, creation timestamp)

### API Endpoints
- `GET /api/quotes` - Retrieve all quotes
- `GET /api/quotes/:id` - Get specific quote by ID
- `POST /api/quotes` - Create new quote
- `PUT /api/quotes/:id` - Update existing quote
- `DELETE /api/quotes/:id` - Delete quote

### Frontend Components
- **QuoteForm**: Comprehensive form for creating new quotes
- **QuotePreview**: Professional-looking quote display with calculations
- **Home**: Main application page with form and preview
- Extensive UI component library from shadcn/ui

### Storage Strategy
- **Development**: In-memory storage (`MemStorage` class)
- **Production**: PostgreSQL via Drizzle ORM
- Storage abstraction allows easy switching between implementations

## Data Flow

1. User fills out the quote form with trip details, group size, and preferences
2. Form data is validated using Zod schemas (shared between client and server)
3. Quote number is auto-generated with format `TPQ-YYYY-XXXXXX`
4. Data is sent to Express API endpoint via TanStack Query mutation
5. Server validates data again and stores in database
6. Response triggers UI update showing the generated quote
7. Quote preview displays calculated totals, destination info, and professional formatting

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Carousel**: Embla Carousel React

### Development Tools
- **Database Migration**: Drizzle Kit
- **Build**: esbuild for server bundling
- **Type Checking**: TypeScript compiler
- **Styling**: PostCSS with Tailwind CSS

## Deployment Strategy

### Build Process
- Frontend: Vite builds static assets to `/dist/public`
- Backend: esbuild bundles server code to `/dist/index.js`
- Shared schemas and types are bundled with both applications

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- Development mode uses in-memory storage if database not available
- Production mode requires database connection

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run db:push` - Database schema migration

The application is designed to be deployed on platforms like Replit, with automatic database provisioning and environment variable management.