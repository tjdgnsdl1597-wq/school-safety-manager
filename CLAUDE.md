# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **School Safety Management System** (학교 안전보건 관리 시스템) built for Incheon Metropolitan Office of Education Safety Mutual Aid Association. It's a Next.js 15 application with TypeScript, using Prisma ORM with PostgreSQL database (SQLite for development), custom React Context authentication, and styled with Tailwind CSS v4.

## Development Commands

- **Development server**: `npm run dev` (starts on http://localhost:3000, but may use port 3001 if 3000 is occupied)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`
- **Vercel build**: `npm run vercel-build` (custom build script that handles Prisma generation and database setup with `--accept-data-loss` flag)
- **Database operations**: 
  - `npx prisma migrate dev --name descriptive_name` (create and apply migrations)
  - `npx prisma generate` (regenerate Prisma client)
  - `npx prisma studio` (open database browser)
  - `npx prisma db push --accept-data-loss` (sync schema to database, used in deployment)

## Architecture Overview

### Database Schema (Prisma)
- **School**: Core entity with name, phoneNumber, contactPerson, linked to schedules. Special "휴무일정" dummy school exists for holiday schedules
- **Schedule**: Visit schedules with date/time, purpose (JSON array), AM/PM slots, and holiday support (isHoliday, holidayReason)
- **Material**: Blog-style posts with title, content, category ("교육자료" or "산업재해"), linked to multiple attachments
- **MaterialAttachment**: Individual files linked to materials (max 5 per post, 50MB total, uploaded to GCS)

### Key Technical Decisions
- **Prisma Client Location**: Generated to `src/generated/prisma` (custom output path)
- **Database**: PostgreSQL for production, SQLite for development (`prisma/dev.db`)
- **API Structure**: RESTful routes in `src/app/api/` using Next.js App Router
- **Frontend**: React Server Components + Client Components with dynamic FullCalendar integration
- **File Storage**: Google Cloud Storage integration for file uploads with public URLs
- **Authentication**: Custom React Context-based authentication with localStorage persistence (replaced NextAuth for stability)
- **Error Handling**: Comprehensive error boundaries and safe data parsing throughout the application

### Application Structure

#### Core Pages
- `/` - Dashboard with calendar view, today's schedule, monthly summaries (admin) / Public hero page (visitors)
- `/schools` - School management (CRUD operations) (admin only)
- `/schedules` - Schedule management with calendar interface (admin only)
- `/educational-materials` - Blog-style material posts with multi-file attachments (public access, admin upload)
- `/educational-materials/[id]` - Individual post detail pages with file downloads
- `/industrial-accidents` - Industrial accident documentation (public access, admin upload)
- `/industrial-accidents/[id]` - Individual post detail pages with file downloads
- `/auth/signin` - Admin login page

#### API Routes
- `/api/schools` - School CRUD operations
- `/api/schedules` - Schedule management with school relations
- `/api/materials` - Multi-file upload/retrieval with category filtering, supports FormData
- `/api/materials/[id]` - Individual post retrieval for detail pages

#### Key Components
- **Navbar**: Navigation with active route highlighting and role-based menu visibility
- **MaterialManager**: File upload and display with thumbnails, admin-only controls
- **AuthCheck**: Global authentication wrapper that handles public/private page access
- **AuthProvider**: Custom React Context provider for authentication state management
- **ScheduleCalendarComponent**: Dynamically imported FullCalendar with comprehensive error handling
- **ErrorBoundary**: Application-wide error catching and user-friendly error display

### Data Patterns

#### Schedule Purpose Format
Purposes are stored as JSON strings in database, parsed as arrays in frontend:
```typescript
// Database: '["월점검", "교육"]'
// Frontend: ["월점검", "교육"]
```

#### School Abbreviations
School names have predefined abbreviations defined in `src/lib/schoolUtils.ts` for calendar display optimization.

#### Multi-File Upload Structure
Materials are blog-style posts with title, content, and up to 5 file attachments (50MB total limit). Files support thumbnails for images and type icons for other formats. All files uploaded to Google Cloud Storage with public URLs stored in MaterialAttachment model with uploadOrder for display sequencing.

#### Holiday Schedule System
- **Holiday Schedules**: Special schedule type with `isHoliday: true` and `holidayReason`
- **UI Behavior**: When holiday checkbox is checked, school selection is hidden, purpose selection is hidden
- **Database Handling**: Holiday schedules use dummy school "휴무일정", auto-created via API
- **Calendar Display**: Holiday schedules show as `🏖️ [holiday reason]` without school name
- **Color Coding**: Holiday schedules display in yellow (#fbbf24) instead of blue

#### Authentication & Authorization
- **Public Pages**: `/`, `/educational-materials`, `/industrial-accidents`, `/auth/signin` - accessible without login
- **Admin Pages**: `/schools`, `/schedules` - require admin authentication
- **Role Check**: `user?.role === 'admin'` from useAuth() hook determines admin status
- **Auto Redirect**: Non-admin users accessing admin pages → educational materials page
- **Authentication Flow**: Simple username/password (admin/rkddkwl12.) with localStorage persistence

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
Components use `const { user, isAuthenticated } = useAuth()` and `const isAdmin = user?.role === 'admin'` for:
- Conditional rendering of admin-only features (upload buttons, delete controls, checkboxes)
- Navigation menu items (admin sees all pages, public sees only educational materials and industrial accidents)
- Page access redirects (handled by individual page components and AuthCheck wrapper)

### Multi-File Upload Architecture
- **MaterialManager Component**: Handles both display and upload functionality with role-based controls, supports multiple file selection
- **GCS Integration**: `src/lib/gcs.ts` provides uploadFileToGCS and deleteFileFromGCS functions
- **API Route**: `/api/materials` handles FormData uploads with multiple files, validates total size (50MB), max count (5), integrates with GCS
- **Database Relations**: Material → MaterialAttachment (one-to-many), supports cascade delete
- **UI Patterns**: Table view with file thumbnails, dedicated post detail pages (no more modals)

### TypeScript Configuration
- Uses Next.js TypeScript setup with strict mode
- Path aliases: `@/*` maps to `./src/*`
- Prisma client types available from `src/generated/prisma`

### Styling Conventions
- Tailwind CSS v4 with custom configuration
- Korean language support (lang="ko")
- Modern glassmorphism design with gradient backgrounds (`bg-white/80 backdrop-blur-sm`)
- Responsive design patterns for mobile compatibility
- Consistent color scheme with blue/indigo gradients and elevated shadows

### Error Handling & Data Safety Patterns
- **Safe JSON Parsing**: Use `safeParsePurpose()` helper for schedule purpose data
- **Safe URL Handling**: Use `safeUrl()` helper for Link component hrefs to prevent format errors
- **Dynamic Imports**: FullCalendar and other heavy components loaded client-side only with error boundaries
- **Data Validation**: All external data (URLs, JSON, user input) validated before use
- **SSR Safety**: Use `typeof window !== 'undefined'` and mounting states to prevent hydration mismatches

## Environment Setup

### Required Environment Variables

**Local Development (.env):**
```bash
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="rkddkwl12."
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_BUCKET_NAME="school-safety-manager"
GOOGLE_CLOUD_KEY_FILE="path/to/service-account-key.json"
PIXABAY_KEY="your-pixabay-api-key-for-image-search"
```

**Production/Vercel:**
```bash
DATABASE_URL="postgresql://..." # PostgreSQL connection string
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="rkddkwl12."
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_BUCKET_NAME="school-safety-manager"
GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"..."}' # Full JSON string
PIXABAY_KEY="your-pixabay-api-key"
```

### Google Cloud Storage Setup
- Service account with Storage Admin role
- Bucket with uniform bucket-level access disabled (for `public: true` uploads)
- Files uploaded with pattern: `{category}/{timestamp}_{filename}`
- Public URLs: `https://storage.googleapis.com/{bucket}/{path}`

### Prerequisites
- Node.js 18+ for Next.js 15 compatibility
- Google Cloud account with Storage API enabled
- Service account key for GCS access

## Next.js 15 Specific Patterns

### API Route Parameters
Next.js 15 App Router requires async params destructuring:
```typescript
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // use id...
}
```

### Critical Deployment Notes
- **Vercel Build Script**: Uses `npm run vercel-build` which includes `--accept-data-loss` flag for Prisma migrations
- **Database Provider**: Production uses PostgreSQL, development uses SQLite - ensure schema.prisma has correct provider
- **File Upload Limits**: 50MB total per post, maximum 5 files, enforced at API level with proper error handling
- **Session Management**: Uses custom localStorage-based authentication to prevent hydration mismatches
- **Component Mounting**: AuthProvider uses mounted state to prevent SSR/client rendering differences
- **FullCalendar Integration**: Always use dynamic imports with client-side only loading to prevent SSR issues

## File Type Support
- **Documents**: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, TXT
- **Images**: JPG, JPEG, PNG, GIF, WEBP (with thumbnail generation)
- **Videos**: MP4, WEBM
- **Upload Pattern**: `{category}/{timestamp}_{filename}` in GCS bucket

## Authentication & Session Management

### Custom Authentication System
- **Auth Configuration**: Located in `src/lib/simpleAuth.tsx` using React Context
- **Default Admin**: Username `admin`, password `rkddkwl12.` (configurable via environment variables)
- **Session Strategy**: localStorage-based with React Context state management
- **Usage Pattern**: Use `const { user, isAuthenticated, login, logout } = useAuth()` hook

### Authentication Implementation Details
- **AuthProvider**: Wraps entire app, manages auth state and localStorage persistence
- **Client-Side Only**: Uses `typeof window !== 'undefined'` checks and mounted state
- **AuthCheck Component**: Implements proper mounting detection to prevent SSR/client mismatches
- **Error Prevention**: Comprehensive error boundaries prevent auth-related crashes

## Dashboard Features

### Monthly Statistics Display
- **Purpose Prioritization**: 월점검 (monthly inspection) always appears first in statistics
- **Detailed Breakdown**: Each purpose shows total count with completion status (방문완료/방문예정)
- **School Name Display**: Non-월점검 purposes show related school names in 2-column grid
- **Mobile Responsive**: Adapts to single column on mobile, proper text wrapping and truncation
- **Data Exclusions**: Holiday schedules (휴무일정) are excluded from monthly statistics
- **Sorting**: School names sorted using Korean locale (`localeCompare(b, 'ko')`)

### Today's Schedule Section
- Shows current day's schedules with time and school abbreviations
- Uses safe parsing for schedule purposes to prevent JSON errors

### Admin Dashboard Layout
- **Left Panel**: Today's schedules and quick links
- **Center Panel**: Monthly statistics with detailed breakdown
- **Right Panel**: Upcoming school visits (formerly "미완료 업무")

## Common Development Workflows

### Adding New Material Categories
1. Update the category validation in `/api/materials` route
2. Add new category to MaterialManager component dropdown
3. Update AuthCheck component publicPages array if needed
4. Create new page route following existing pattern (`/[category]/page.tsx`)

### File Upload Process
1. Files validated at client-side (count, size, type)
2. FormData sent to `/api/materials` with multiple files
3. Files uploaded to GCS with structured naming
4. Database records created for Material and MaterialAttachment
5. UI updates with new post and file thumbnails

### Database Schema Updates
Always use Prisma migrations for production compatibility:
```bash
npx prisma migrate dev --name "descriptive_change_name"
npx prisma generate
```
For deployment, ensure Vercel build script handles schema changes with `--accept-data-loss` flag.

## Critical Error Prevention Patterns

### Safe Data Handling
Always use these helper functions to prevent runtime errors:
```typescript
// For JSON parsing
const purposes = safeParsePurpose(schedule.purpose); // Returns [] if invalid

// For URL validation
const href = safeUrl(material.filePath); // Returns '#' if invalid

// For safe event creation
const calendarEvents = safeCreateCalendarEvents(schedules); // Filters invalid data
```

### Component Safety Patterns
- **FullCalendar**: Always use dynamic imports with error boundaries
- **Link Components**: Always validate URLs before passing to href
- **Data Rendering**: Wrap all external data access in try-catch blocks
- **localStorage Access**: Always check `typeof window !== 'undefined'` first

### Common Error Sources to Avoid
1. **JSON Parsing**: Schedule purpose data can be malformed - always use `safeParsePurpose()`
2. **URL Formatting**: File paths can be null/invalid - always use `safeUrl()` 
3. **SSR Hydration**: Client-only components must use mounting states
4. **Data Access**: External API data should be validated before use
5. **TypeScript Interfaces**: When adding new schedule fields, update both database schema and TypeScript interfaces
6. **Holiday Schedule Logic**: Always check `isHoliday` flag when processing schedules to handle different UI/logic paths

## Critical TypeScript Patterns

### Schedule Interface Requirements
When working with schedules, always include optional holiday fields:
```typescript
interface Schedule {
  id: string;
  date: string;
  schoolId: string;
  school: { name: string; abbreviation?: string | null; };
  ampm: string;
  startTime: string;
  endTime: string;
  purpose: string; // JSON stringified array
  otherReason?: string;
  isHoliday?: boolean;
  holidayReason?: string | null;
}
```

### API Route Parameter Handling (Next.js 15)
Always destructure params asynchronously in API routes:
```typescript
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // use id...
}
```