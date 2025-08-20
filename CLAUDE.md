# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **School Safety Management System** (학교 안전보건 관리 시스템) built for Incheon Metropolitan Office of Education Safety Mutual Aid Association. It's a Next.js 15 application with TypeScript, using Prisma ORM with PostgreSQL database (SQLite for development), custom React Context authentication, and styled with Tailwind CSS v4.

## Development Commands

- **Development server**: `npm run dev` (starts on http://localhost:3000, auto-increments port if occupied, e.g., 3004)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`
- **Vercel build**: `npm run vercel-build` (custom build script that handles Prisma generation and database setup with `--force-reset` flag)
- **Database operations**: 
  - `npx prisma migrate dev --name descriptive_name` (create and apply migrations)
  - `npx prisma generate` (regenerate Prisma client)
  - `npx prisma studio` (open database browser)
  - `npx prisma db push --force-reset` (sync schema to database, used in deployment with data loss acceptance)

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
- `/api/materials` - Multi-file upload/retrieval with category filtering, supports FormData (traditional upload)
- `/api/materials/signed-url` - Google Cloud Storage signed URL generation for direct client uploads
- `/api/materials/metadata` - Save file metadata to database after successful GCS uploads
- `/api/materials/[id]` - Individual post retrieval for detail pages

#### Key Components
- **Navbar**: Navigation with active route highlighting and role-based menu visibility
- **MaterialManager**: File upload and display with thumbnails, admin-only controls
- **AuthCheck**: Global authentication wrapper that handles public/private page access
- **AuthProvider**: Custom React Context provider for authentication state management
- **ScheduleCalendarComponent**: Dynamically imported FullCalendar with comprehensive error handling and optimized layout
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
- **Calendar Display**: Holiday schedules show as `🏖️ [holiday reason]` in 2-line format (time + reason)
- **Color Coding**: Holiday schedules display in yellow (#fbbf24) background with black text (#000000)

#### Authentication & Authorization
- **Public Pages**: `/`, `/educational-materials`, `/industrial-accidents`, `/auth/signin`, `/auth/signup` - accessible without login
- **User Pages**: `/dashboard`, `/schools`, `/schedules` - require user authentication (both regular users and super admins)
- **Admin Pages**: `/admin/*` - require super admin authentication only
- **Role Check**: `isSuperAdmin(user)` from `@/lib/authUtils` determines super admin status
- **Data Separation**: User-specific data (schools, schedules, dashboard memos) stored per user, shared data (educational materials, industrial accidents) accessible to all
- **Authentication Flow**: Simple username/password with localStorage persistence, includes user registration with approval system

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
Components use `const { user, isAuthenticated } = useAuth()` and `isSuperAdmin(user)` from `@/lib/authUtils` for:
- Conditional rendering of admin-only features (upload buttons, delete controls, user approval popup)
- Navigation menu items (authenticated users see dashboard/schools/schedules, super admins see additional admin features)
- Page access redirects (handled by AuthCheck wrapper with PUBLIC_PAGES and USER_PAGES arrays)
- Data access control (user-specific vs. shared data patterns)

### Multi-File Upload Architecture
- **Hybrid Upload Strategy**: 교육자료 (Educational Materials) use direct Google Cloud Storage upload bypassing Vercel's 4.5MB limit, while 산업재해 (Industrial Accidents) use traditional Vercel upload
- **MaterialManager Component**: Handles both display and upload functionality with role-based controls, category-specific upload routing
- **Direct GCS Upload**: `/api/materials/signed-url` generates signed URLs for direct client-side uploads, `/api/materials/metadata` saves file metadata after successful uploads
- **Traditional Upload**: `/api/materials` handles FormData uploads with multiple files for smaller files
- **Database Relations**: Material → MaterialAttachment (one-to-many), supports cascade delete
- **UI Patterns**: Table view with file thumbnails, dedicated post detail pages

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
- Calendar-specific CSS classes: `.fc-custom-event` (blue), `.fc-holiday-event` (yellow)
- Horizontal toolbar layout optimizations in globals.css for space efficiency

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
- Bucket with uniform bucket-level access disabled (for ACL-based permissions)
- CORS policy configured for direct client uploads from Vercel domains
- Files uploaded with pattern: `{category}/{timestamp}_{sanitized_filename}`
- Filename sanitization: Korean/special characters removed, length limited to 50 chars
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
- **PWA Support**: Progressive Web App with standalone mode, app shortcuts, service worker, and SSIA logo icons

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

### Dashboard Layout (7-column grid)
- **Left Panel (2/7 width)**: User information, today's schedule, monthly statistics, recent industrial accidents
- **Right Panel (5/7 width)**: FullCalendar with minimum 600px height, memo system below calendar

### User Information Section
- **Profile Display**: Profile photo (20x20, circular) with 2-column information layout
- **Information Fields**: Department/position, contact number, name, email with fallback values
- **Real-time Clock**: Updates every second in YYYY.MM.DD HH:mm:ss format

### Monthly Statistics Display
- **Purpose Prioritization**: 월점검 appears first with simplified display (progress bar only)
- **Other Purposes**: Detailed breakdown showing completion status (완료/예정/총 for regular purposes, 발생/총 for 산업재해)
- **Color-Coded Status**: Completed schools in light green, upcoming schools in light purple
- **School Display**: 3-column grid layout, completed schools shown first
- **Visual Enhancement**: Strong borders, gradient backgrounds, progress bars
- **Data Exclusions**: Holiday schedules excluded from statistics
- **Purpose Order**: 월점검, 위험성평가, 근골조사, 교육, 산업재해

### Today's Schedule Section
- Shows current day's schedules with time and school abbreviations
- Real-time clock display in header
- Uses safe parsing for schedule purposes to prevent JSON errors

### Memo System
- **User-Specific Storage**: Memos stored with key `dashboard-memos-${user.id}` in localStorage
- **CRUD Operations**: Single-line input, save/edit/delete functionality 
- **Auto-Load**: Memos automatically loaded on user login
- **UI**: Input field with Enter key support, scrollable list with max-height 240px

### Calendar UI Patterns
- **Event Display**: 2-line format (time on first line, "school, purpose" on second line)
- **Holiday Events**: Yellow background (#fbbf24) with black text, 2-line format showing time and holiday reason
- **Vacation Events**: Yellow background for 휴가/휴가일정 purposes (휴가 일정 also gets yellow styling)
- **Regular Events**: Blue background (#3b82f6) with white text, truncated text with ellipsis for overflow
- **Toolbar Layout**: Horizontal arrangement - prev button (left), title (center), next + view buttons (right)
- **No Today Button**: Removed from toolbar for cleaner interface
- **Responsive Design**: Smaller buttons and fonts on mobile, maintains horizontal layout

### Modal Behavior
- **Schedule Detail Modal**: No dark background overlay, keeps dashboard visible behind popup
- **Enhanced Visibility**: Strong shadows (shadow-2xl) and blue ring borders for clear distinction
- **Click Outside**: Modal can be closed by clicking the close button (background clicks don't close modal)

## Common Development Workflows

### Adding New Material Categories
1. Update the category validation in `/api/materials` route
2. Add new category to MaterialManager component dropdown
3. Update AuthCheck component publicPages array if needed
4. Create new page route following existing pattern (`/[category]/page.tsx`)

### File Upload Process

**교육자료 (Educational Materials) - Direct GCS Upload:**
1. Client validates files (count, size, type, 50MB total limit)
2. Request signed URLs from `/api/materials/signed-url`
3. Direct client upload to Google Cloud Storage using signed URLs
4. Send metadata to `/api/materials/metadata` to create database records
5. UI updates with new post and file links

**산업재해 (Industrial Accidents) - Traditional Upload:**
1. Client validates files (count, size, type, 4.5MB per file limit)
2. FormData sent to `/api/materials` with multiple files
3. Files processed and stored via traditional Vercel upload
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
7. **GCS Upload Errors**: Common 403/500 errors are due to missing CORS config, incorrect service account permissions, or malformed signed URLs

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

## Progressive Web App (PWA) Implementation

### PWA Architecture
- **Manifest**: `/public/manifest.json` configured with Korean language support, SSIA branding, and app shortcuts
- **Service Worker**: `/public/sw.js` handles offline caching and background sync
- **Icons**: Multiple sizes (48x48, 192x192, 512x512) based on SSIA logo for various device contexts
- **Display Mode**: Standalone mode for native app-like experience

### Mobile Safe Area Support
- **Viewport Configuration**: `viewport-fit=cover` enables full-screen coverage on modern devices
- **CSS Variables**: Safe area inset environment variables for iOS notch/Dynamic Island and Android navigation
- **Custom CSS Classes**: `.pt-safe`, `.pb-safe`, `.py-safe`, `.px-safe` for consistent safe area handling
- **PWA-Specific Styles**: `@media (display-mode: standalone)` ensures proper content display in installed app

### Safe Area Implementation
```css
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
}

.pb-safe { 
  padding-bottom: max(1rem, var(--safe-area-inset-bottom)); 
}
```

### PWA Installation Features
- **App Shortcuts**: Direct links to Dashboard and Educational Materials
- **Install Prompts**: Browser-native installation prompts on desktop and mobile
- **Offline Support**: Service worker caches critical resources for offline access
- **Touch Scrolling**: `-webkit-overflow-scrolling: touch` for smooth mobile interaction

## Critical Troubleshooting

### Google Cloud Storage Upload Issues

**403 Forbidden Errors:**
- Check service account has Storage Admin role
- Verify CORS policy allows your domain origins
- Ensure bucket has uniform bucket-level access disabled
- Confirm signed URL generation doesn't include contentType parameter (causes signature mismatches)

**500 Internal Server Errors:**
- Verify GOOGLE_CLOUD_CREDENTIALS environment variable is properly formatted JSON
- Check service account key is not expired or revoked
- Ensure GOOGLE_CLOUD_PROJECT_ID and GOOGLE_CLOUD_BUCKET_NAME are correct

**SignatureDoesNotMatch Errors:**
- Generate new service account key and update Vercel environment variables
- Remove old/expired keys from Google Cloud Console
- Verify credentials are wrapped in `{ credentials: parsedCredentials }` object

### File Upload Validation
- **교육자료**: Maximum 50MB total, 5 files max, direct GCS upload
- **산업재해**: Maximum 4.5MB per file, traditional Vercel upload
- Always validate file types against allowedTypes array in signed-url route
- Filename sanitization removes Korean characters and limits to 50 characters