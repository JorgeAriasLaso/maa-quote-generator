# Educational Travel Quote Generator

## Overview

This is a full-stack web application for generating professional travel quotes for educational institutions. The system allows users to create detailed travel quotes for school trips, including destinations, pricing, and additional services. The application is branded for "My Abroad Ally" travel agency specializing in educational travel.

## User Preferences

Preferred communication style: Simple, everyday language.
Company branding: "My Abroad Ally" with yellow brand colors
Trip types: Work Experience Mobility, Job Shadowing, School Exchange, Other

## Recent Changes

✓ Integrated My Abroad Ally company logo in web app header and quote preview
✓ Updated brand colors to yellow theme (hsl(48, 98%, 60%)) 
✓ Modified trip type options to: Work Experience Mobility, Job Shadowing, School Exchange, Other
✓ Added company branding throughout quote documents
✓ Updated contact information to myabroadally.com domain
✓ Fixed storage type issues for boolean fields
✓ Created comprehensive city-specific content for 18 European destinations
✓ Added PostgreSQL database with Drizzle ORM integration
✓ Replaced in-memory storage with persistent database storage
✓ Updated destination field to organized dropdown menu with countries as headers
✓ Added "Other" option with custom destination input field for non-listed cities
✓ Implemented automatic date/duration calculations for improved user experience
✓ Reverted to single school address field for simplified data entry
✓ Changed teacher discount to direct price per teacher field
✓ Created comprehensive costing calculation module with real-time pricing
✓ Added automatic pricing based on destination, duration, group size, and services
✓ Implemented group discounts for larger groups (5-12% off for 30+ participants)
✓ Added detailed cost breakdowns in both form and quote preview
✓ Replaced "TBD" placeholders with accurate pricing calculations
✓ Updated costing structure to show individual components (accommodation, meals, transport, coordination fees, airport transfers)
✓ Separated student and teacher cost breakdowns with different rates and discount structures
✓ Added visual distinction between student costs (blue) and teacher costs (green) in the interface
✓ Added custom pricing input fields for manual pricing override
✓ Separated daily rates (accommodation, breakfast, lunch, dinner) and total trip amounts (local transportation card, coordination fees, airport transfers)
✓ Updated costing calculation engine to use custom pricing when provided, falling back to default destination-based pricing
✓ Added comprehensive form fields for manual price inputs with clear labeling and placeholders
✓ Updated database schema with new custom pricing fields and performed database migration
✓ Changed default pricing to zero - all costs start at €0 and require manual input for any charges
✓ Added service selection checkboxes next to each pricing field for cleaner interface
✓ Implemented conditional display logic so only selected services appear in quotes and pricing calculations
✓ Split accommodation pricing into separate fields for students and teachers with independent rates
✓ Updated transport card label to "Local Transportation Card" throughout the application
✓ Implemented comprehensive Erasmus+ funding calculation system for internal pricing strategy
✓ Added funding rates for students (€66/€46, €57/€40, €48/€34) and teachers (€117/€82, €104/€73, €91/€64) across three country groups
✓ Created duration-based funding calculations (different rates for days 1-14 vs 15+) to help compare quoted prices against available school funding
✓ Erasmus funding display shows schools potential funding amounts to help justify trip value and encourage bookings
✓ Added comprehensive internal cost analysis section for profitability tracking
✓ Created separate cost input fields for accommodation, meals, transport, and coordination fees
✓ Implemented real-time profit margin calculations with color-coded indicators (green >20%, yellow >10%, red <10%)
✓ Added detailed cost breakdown display showing revenue vs costs with net profit analysis
✓ Standard costs: Student coordination €60, Teacher coordination €0, Local coordinator €150
✓ Fixed array handling issue in additional services cost calculation to prevent crashes
✓ Added real-time internal cost tracking in quote form for live profitability updates
✓ Fixed undefined variable crash (accommodationPerDay references) in cost breakdown display
✓ Implemented live cost breakdown updates from form to preview for real-time profitability analysis
✓ Added profit per student and profit per teacher calculations in profitability section
✓ Enhanced Erasmus+ funding display with detailed student/teacher breakdown and country group information
✓ Added PDF export protection - Erasmus+ funding and internal profitability analysis now excluded from customer PDFs
✓ Implemented CSS class system (.internal-analysis-only) to hide sensitive business data from customer-facing documents
✓ Fixed duration calculation to count full days only (Oct 4-7 = 3 days, not 4 days) for accurate costing
✓ Fixed teacher meal pricing calculation - teacher discount now only applies when using default pricing, not custom pricing
✓ Eliminated all discounts from calculations - removed teacher meal discounts and group discounts for transparent pricing
✓ Added airport transfer cost input field to internal analysis section for accurate profitability tracking

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
- **QuoteForm**: Comprehensive form with real-time pricing calculations
- **QuotePreview**: Professional quote display with detailed cost breakdowns
- **Home**: Main application page with form and preview
- **Costing Module**: Intelligent pricing engine with destination-based rates
- Extensive UI component library from shadcn/ui

### Storage Strategy
- **Current**: PostgreSQL via Drizzle ORM (`DatabaseStorage` class)
- **Fallback**: In-memory storage (`MemStorage` class) available for development
- Storage abstraction allows easy switching between implementations
- Database connection via Neon PostgreSQL serverless

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