# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **School Safety Management System** (학교 안전보건 관리 시스템) built for Incheon Metropolitan Office of Education Safety Mutual Aid Association. It's a Next.js 15 application with TypeScript, using Prisma ORM with SQLite database, and styled with Tailwind CSS v4.

## Development Commands

- **Development server**: `npm run dev` (starts on http://localhost:3000, but may use port 3001 if 3000 is occupied)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`
- **Vercel build**: `npm run vercel-build` (custom build script that handles Prisma generation and database setup)
- **Database operations**: 
  - `npx prisma migrate dev` (create and apply migrations)
  - `npx prisma generate` (regenerate Prisma client)
  - `npx prisma studio` (open database browser)

## Architecture Overview

### Database Schema (Prisma)
- **School**: Core entity with name, phoneNumber, contactPerson
- **Schedule**: Visit schedules linked to schools with date/time, purpose, AM/PM slots
- **Material**: Educational materials and industrial accident documents with file uploads

### Key Technical Decisions
- **Prisma Client Location**: Generated to `src/generated/prisma` (custom output path)
- **Database**: SQLite for development (`prisma/dev.db`)
- **API Structure**: RESTful routes in `src/app/api/` using Next.js App Router
- **Frontend**: React Server Components + Client Components with FullCalendar integration
- **File Storage**: Google Cloud Storage integration for file uploads with public URLs
- **Authentication**: NextAuth.js with role-based access control (admin vs. public access)

### Application Structure

#### Core Pages
- `/` - Dashboard with calendar view, today's schedule, monthly summaries (admin only)
- `/schools` - School management (CRUD operations) (admin only)
- `/schedules` - Schedule management with calendar interface (admin only)
- `/educational-materials` - File uploads for educational content (public access, admin upload)
- `/industrial-accidents` - Industrial accident documentation (public access, admin upload)
- `/auth/signin` - Admin login page

#### API Routes
- `/api/schools` - School CRUD operations
- `/api/schedules` - Schedule management with school relations
- `/api/materials` - File upload/retrieval with category filtering

#### Key Components
- **Navbar**: Navigation with active route highlighting and role-based menu visibility
- **MaterialManager**: File upload and display with thumbnails, admin-only controls
- **AuthCheck**: Global authentication wrapper that handles public/private page access
- **Providers**: NextAuth session provider wrapper

### Data Patterns

#### Schedule Purpose Format
Purposes are stored as JSON strings in database, parsed as arrays in frontend:
```typescript
// Database: '["월점검", "교육"]'
// Frontend: ["월점검", "교육"]
```

#### School Abbreviations
School names have predefined abbreviations defined in `src/lib/schoolUtils.ts` for calendar display optimization.

#### File Upload Structure
Materials support categories ("교육자료", "산업재해") with optional thumbnail paths for display. Files are uploaded to Google Cloud Storage and stored with public URLs in the database.

#### Authentication & Authorization
- **Public Pages**: `/`, `/educational-materials`, `/industrial-accidents`, `/auth/signin` - accessible without login
- **Admin Pages**: `/schools`, `/schedules` - require admin authentication
- **Role Check**: `session?.user?.role === 'admin'` determines admin status
- **Auto Redirect**: Non-admin users accessing admin pages → educational materials page

## Development Guidelines

### Database Changes
Always create Prisma migrations for schema changes:
```bash
npx prisma migrate dev --name descriptive_name
npx prisma generate
```

### API Error Handling
All API routes include Prisma error handling for common scenarios (P2002 unique constraint, P2025 not found).

### Role-Based UI Patterns
Components check `const { data: session } = useSession()` and `const isAdmin = session?.user?.role === 'admin'` for:
- Conditional rendering of admin-only features (upload buttons, delete controls, checkboxes)
- Navigation menu items (admin sees all pages, public sees only educational materials and industrial accidents)
- Page access redirects (handled by individual page components and AuthCheck wrapper)

### File Upload Architecture
- **MaterialManager Component**: Handles both display and upload functionality with role-based controls
- **GCS Integration**: `src/lib/gcs.ts` provides uploadFileToGCS and deleteFileFromGCS functions
- **API Route**: `/api/materials` handles FormData uploads, integrates with GCS, stores metadata in database
- **Error Handling**: Graceful fallbacks for GCS failures, user-friendly error messages

### TypeScript Configuration
- Uses Next.js TypeScript setup with strict mode
- Path aliases: `@/*` maps to `./src/*`
- Prisma client types available from `src/generated/prisma`

### Styling Conventions
- Tailwind CSS v4 with custom configuration
- Korean language support (lang="ko")
- Responsive design patterns for mobile compatibility

## Environment Setup

### Required Environment Variables

**Local Development (.env):**
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password123"
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_BUCKET_NAME="school-safety-manager"
GOOGLE_CLOUD_KEY_FILE="path/to/service-account-key.json"
```

**Production/Vercel:**
- Same as above, but replace `GOOGLE_CLOUD_KEY_FILE` with:
- `GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"..."}' # Full JSON string`

### Google Cloud Storage Setup
- Service account with Storage Admin role
- Bucket with uniform bucket-level access disabled (for `public: true` uploads)
- Files uploaded with pattern: `{category}/{timestamp}_{filename}`
- Public URLs: `https://storage.googleapis.com/{bucket}/{path}`

### Prerequisites
- Node.js 18+ for Next.js 15 compatibility
- Google Cloud account with Storage API enabled
- Service account key for GCS access