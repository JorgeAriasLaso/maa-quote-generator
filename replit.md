# Educational Travel Quote Generator

## Overview
This full-stack web application, branded for "My Abroad Ally," generates professional travel quotes for educational institutions. It facilitates the creation of detailed quotes for school trips, including destinations, pricing, and additional services, with a focus on Erasmus+ funding calculations and internal profitability analysis. The system aims to streamline the quoting process, provide transparent pricing, and offer internal tools for financial tracking.

## User Preferences
Preferred communication style: Simple, everyday language.
Company branding: "My Abroad Ally" with yellow brand colors
Trip types: Work Experience Mobility, Job Shadowing, School Exchange, Other

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **UI/UX Decisions**:
    - "My Abroad Ally" branding with yellow theme (hsl(48, 98%, 60%)) and logo integration.
    - Professional quote display with detailed cost breakdowns, visual distinction for student/teacher costs (blue/green), and dynamic pricing updates.
    - Comprehensive form fields with clear labeling, placeholders, and conditional display logic for services.
    - Responsive grid layouts for destination images and refined PDF export formatting for standard A4 pages with precise margins and page breaks.
    - Client management system with search, filtering, and quote history.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Style**: RESTful API
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Schema Validation**: Zod

### Core Technical Implementations
- **Costing Module**: Real-time pricing calculations based on destination, duration, group size, and services. Includes separate student/teacher cost breakdowns, custom pricing overrides, and detailed cost components (accommodation, meals, transport, coordination fees, airport transfers).
- **Erasmus+ Funding Calculation**: Comprehensive system calculating student and teacher funding rates across country groups and durations, for internal comparison against quoted prices.
- **Internal Profitability Analysis**: Real-time profit margin calculations with color-coded indicators, detailed revenue vs. costs display, and internal cost input fields. This data is excluded from customer-facing PDFs.
- **Client Management System**: Features for creating, searching, selecting, and managing client data, including quote history tracking.
- **PDF Export**: Server-side PDF generation using Puppeteer, ensuring reliable two-page output with proper CSS page breaks, optimized file sizes, and professional layout. Sensitive business data is hidden from customer PDFs.
- **Data Persistence**: PostgreSQL via Drizzle ORM for storing quotes and client information.
- **Form System**: Dual form system (React Hook Form for new quotes, controlled inputs for editing/copying) to ensure stability and feature parity.

## External Dependencies

- **Database**: Neon PostgreSQL serverless
- **UI Components**: Radix UI primitives (via shadcn/ui)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Carousel**: Embla Carousel React
- **PDF Generation**: Puppeteer (server-side)

## Version History

### VERSION 1.0 MILESTONE COMPLETED
The application has reached a stable, fully functional state suitable for production use with all core features implemented:
- Complete quote generation system with real-time calculations
- Professional PDF export with optimized file sizes  
- Client management with CSV import capabilities
- Internal profitability analysis with Erasmus+ funding calculations
- Google Sheets export functionality
- My Abroad Ally branding and favicon integration

### VERSION 1.1 IMPROVEMENTS (Completed - January 2025)
Enhanced Quote History with expanded information display:
✓ Added Students Accommodation column between Destination and Total
✓ Added Net Profit column showing real-time profitability calculations
✓ Added Average Profit per Traveller column for per-person profitability analysis
✓ Improved visual layout with color-coded profit indicators (green/red)
✓ Condensed layout with 6-column grid for better information density
✓ Added direct PDF download icon in quote history table
✓ Enhanced PDF text resolution with 2.0x canvas scale and 92% JPEG quality
✓ Fixed Malaga-specific PDF page break issues with improved Investment Summary positioning
✓ Implemented auto-download functionality through dedicated quote detail pages