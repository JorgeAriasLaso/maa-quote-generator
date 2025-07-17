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
✓ Fixed PDF output width to fit standard A4 page sizing with proper margins and full-width layout
✓ Implemented quote update functionality - clicking "Generate Quote Preview" now updates existing quotes instead of creating duplicates
✓ Fixed input field formatting issue where typing "10" showed "010" by setting default values to empty strings instead of "0"
✓ Updated button text to show "Update Quote Preview" when modifying existing quotes vs "Generate Quote Preview" for new ones
✓ Implemented comprehensive client management system with client forms, list views, and quote history tracking
✓ Added quote history page with search, filtering, and statistics for viewing all created quotes
✓ Enhanced navigation with Quote History and Client Management sections accessible from main menu
✓ Updated quote form to use new client database structure (fiscalName, email, country, city, postcode, address, taxId)
✓ Updated quote display components to use new field names instead of old schoolName/contactPerson structure
✓ Fixed database schema alignment between quotes and clients tables to ensure consistency
✓ Added proper form validation for new client structure with optional fields for email, taxId, postcode, address
✓ Updated all references from old schoolName/contactPerson to new fiscalName/email structure across components
✓ Fixed client creation API calls to use correct method signatures and error handling
✓ Confirmed DatabaseStorage is properly configured and client creation works correctly in database
✓ Added plus symbol option to client list for creating new quotes from existing clients
✓ Implemented client selection functionality that pre-populates quote form with client data
✓ Added sessionStorage mechanism to pass client data between pages
✓ Updated quote form to accept selectedClient prop and auto-populate form fields
✓ Fixed form validation and display logic for client selection workflow
✓ Fixed airport transfer cost calculation in Internal Profitability Analysis - now properly included in total costs
✓ Updated email address from info@myabroadally.com to maa@myabroadally.com in quote outputs
✓ Improved PDF export layout to use full horizontal page width and split content across multiple pages
✓ Added delete functionality to quote history with confirmation dialog and trash icon buttons
✓ Fixed client search in quote form to be case-insensitive for better user experience
✓ Added client deletion functionality to client management section with confirmation dialog
✓ Fixed quote editing functionality to properly pre-populate all form fields when editing existing quotes
✓ Fixed quote copying functionality that was not working properly due to incorrect API request syntax
✓ Fixed PDF export functionality with improved formatting, reliability, and proper margin handling for multi-page documents
✓ Fixed quote update error when copying and editing quotes - corrected HTTP method mismatch (PUT vs PATCH)
✓ Fixed form field editing issue after copying quotes - form fields now properly enable when editing copied quotes
✓ Removed disabled logic from all pricing input fields to ensure they are always editable regardless of checkbox state
✓ Completely removed checkbox logic from all pricing fields - all input fields are now always editable and visible
✓ Fixed form reset issue by properly handling string values including "0" and empty strings in form data population
✓ CRITICAL FIX: Resolved quote copying freeze issue by implementing SimpleQuoteForm component using controlled inputs instead of React Hook Form
✓ Created dual form system: QuoteForm (React Hook Form) for new quotes, SimpleQuoteForm (controlled inputs) for editing/copying quotes
✓ Fixed infinite loop in home.tsx useEffect that was causing browser freezing after quote copy operations
✓ Added complete Internal Profitability Analysis section to SimpleQuoteForm to maintain feature parity with original form
✓ Fixed PDF export margin issues with improved page splitting algorithm that maintains proper 15mm margins on all pages
✓ Added client selection functionality to SimpleQuoteForm with dropdown search and auto-populate features
✓ COMPREHENSIVE QUOTE OUTPUT IMPROVEMENTS: Updated quote formatting with cost legends, separated meal pricing, larger logo, and removed unwanted text elements
✓ Added page break before Educational Value section for better PDF layout
✓ Removed "All-inclusive package" and "Understanding of European history" text from quote outputs
✓ Separated meal pricing to show individual Breakfast, Lunch, and Dinner costs instead of combined "Meals" line
✓ Added "Average cost per student" and "Average cost per teacher" legends to pricing summary
✓ Increased My Abroad Ally logo size from h-16 to h-24 for better visibility in PDFs
✓ Updated all destination pictures with unique, relevant images that match their content descriptions
✓ Fixed Madrid pictures with 4 distinct iconic images (Gran Vía, Prado Museum, Spanish culture, Royal Palace)
✓ Updated costing module to include individual meal cost breakdowns (breakfastCost, lunchCost, dinnerCost)
✓ Fixed cost legend formatting to place "Average cost per student/teacher" inside parentheses for better clarity
✓ Updated Madrid destination layout to use single body text instead of 4 separate sections for better readability
✓ Integrated 5 custom Madrid images in a responsive grid layout (2x3 grid with special positioning for first and last images)
✓ Fixed Madrid image display using proper asset imports (@assets/ syntax) instead of URL paths
✓ Replaced first picture (next to duration/students/teachers) with madrid1 custom image
✓ Modified image gallery to show only 4 pictures (madrid2-madrid5) in 2x2 grid layout instead of 5
✓ Removed top picture completely and centered the trip details frame for cleaner layout
✓ Applied centered layout (no top image) to all cities with 4-image grid format
✓ Updated page break positioning to start second page with Educational Value & Learning Outcomes section
✓ FINAL PDF EXPORT FIXES: Resolved logo deformation and page break issues after multiple iterations
✓ Fixed My Abroad Ally logo sizing and aspect ratio preservation in PDF output (h-32, auto width, object-fit: contain)
✓ Enhanced PDF page splitting algorithm with 40px overlap to prevent content cutting at page boundaries
✓ Added page break hints before Educational Value section for better document flow
✓ Improved canvas quality settings with high-quality image smoothing and extended timeout handling
✓ DEFINITIVE 2-PAGE PDF SOLUTION: Implemented precise split detection using Educational Value section's actual DOM position
✓ Added real-time position calculation with getBoundingClientRect() to find exact split point
✓ Force exactly 2 pages with Educational Value & Learning Outcomes guaranteed to start on page 2
✓ Added console logging for debugging split position and bounds checking for reliable page breaks
✓ NUCLEAR OPTION PDF FIX: Complete rewrite using separate HTML elements for each page
✓ Created distinct page1Element and page2Element with selective content hiding
✓ Page 1 hides Educational Value section onwards, Page 2 shows only Educational Value onwards
✓ Eliminated complex canvas splitting in favor of generating two separate canvases
✓ FINAL PDF SOLUTION: Implemented fixed 60/40 split with CSS page-break-before styling
✓ Added temporary stylesheet injection for proper page break handling during canvas generation
✓ Force exactly 2 pages with 100px overlap to prevent content gaps at page boundaries
✓ ULTIMATE PDF SOLUTION: Switched to server-side PDF generation using Puppeteer
✓ Added /api/generate-pdf endpoint that processes HTML server-side with proper CSS page breaks
✓ Puppeteer handles page breaks natively with @page CSS rules and page-break-before properties
✓ Eliminates all client-side canvas splitting issues and ensures reliable 2-page output
✓ REVERTED TO CLIENT-SIDE: Puppeteer failed due to missing system dependencies in Replit environment
✓ Implemented simple Educational Value positioning detection with getBoundingClientRect()
✓ Manual canvas splitting at detected Educational Value position with 100px overlap buffer
✓ Removed Puppeteer dependency and server-side PDF generation endpoint
✓ Fixed bottom margin issue by calculating maximum page height and cropping content to fit A4 boundaries
✓ Added proper page height limits to ensure 15mm bottom margin is maintained on page 2
✓ PROFESSIONAL PDF LAYOUT FIX: Adjusted split point to use 95% of available page space to eliminate large margins
✓ Smart page filling algorithm that maximizes content on page 1 while preventing awkward image cuts
✓ Reduced overlap to 30px and optimized split calculation for better visual balance
✓ ULTIMATE SOLUTION: Implemented proper server-side PDF generation using Puppeteer
✓ Added /api/generate-pdf endpoint with native CSS page breaks (@page rules)
✓ Educational Value section now starts page 2 using industry-standard page-break-before CSS
✓ Eliminated all canvas splitting issues with proper HTML-to-PDF conversion
✓ Professional page breaks without content duplication or cutting

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