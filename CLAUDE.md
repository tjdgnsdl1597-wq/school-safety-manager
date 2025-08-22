# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 **최우선: 사용자 개인정보 보호 규정** 🚨

### **🔥 CRITICAL: 절대 금지 사항 (NEVER DELETE) 🔥**
**⚠️ 실제 운영 서비스로 1000명 이상의 사용자가 이용할 예정입니다. 다음 개인정보들은 어떤 상황에서도 삭제/손실하면 안됩니다:**

#### **💾 자동 백업 시스템 (1시간마다)**
- **Vercel Cron Job**이 `/api/auto-backup`을 매시간 자동 실행
- 모든 사용자의 개인정보가 자동으로 백업됨
- 사용자 수 무제한 지원 (현재 3명 → 1000명까지 대응)

#### **📋 백업 대상 개인정보 (전체 목록)**
1. **사용자 계정 정보**
   - 아이디, 암호화된 비밀번호, 실명, 직급, 연락처
   - 이메일, 부서, 프로필사진, 권한, 가입일시
   - 집주소, 회사주소 (이동시간 계산용)

2. **사용자별 등록 학교 정보** 
   - 각 사용자가 담당하는 학교 데이터 (강성훈: 32개, 홍길동: 1개 등)
   - 학교명, 연락처, 담당자, 주소 정보

3. **사용자별 일정 관리 데이터**
   - 개인별 방문 일정, 목적, 시간대
   - 휴일 일정, 특별 사유 등

4. **이동시간 계산 기록**
   - 개인별 출발지-목적지 이동시간 데이터
   - 경로 최적화 정보

5. **개인 메모 및 설정**
   - 대시보드 개인 메모
   - 사용자별 개인화 설정

#### **⚡ 긴급 복구 명령어**
사용자 데이터가 손실되었을 때:
```
마지막 사용자 데이터 백업 시간알려주고 가장최신껄로 복구해줘
```
→ 즉시 최신 백업으로 모든 개인정보 복원

#### **📱 일반 백업 명령어**
- `사용자 데이터 백업해줘` → 즉시 수동 백업
- `백업 상태 확인해줘` → 마지막 백업 시간 확인

### **🚨 데이터 손실 시 대응 절차**
1. **즉시 백업 상태 확인**: GET `/api/auto-backup`
2. **최신 백업으로 복원**: POST `/api/restore-backup` 
3. **복원 후 데이터 무결성 검증**: 사용자 수, 학교 수, 일정 수 확인
4. **긴급 상황시**: 1시간 이내 최신 데이터로 100% 복구 가능

### **💀 절대 금지되는 위험한 작업들**
```bash
# 이런 명령어들은 사용자 데이터를 완전 삭제함!
npx prisma db push --force-reset  # 전체 데이터베이스 초기화
npx prisma migrate reset          # 모든 사용자 데이터 삭제
DELETE FROM User;                 # 모든 사용자 계정 삭제
DROP TABLE User;                  # 사용자 테이블 삭제
```

### **✅ 안전한 개발 워크플로우**
1. **개발 전**: 반드시 최신 백업 확인
2. **스키마 변경 시**: 기존 데이터 보존하는 migration만 허용
3. **배포 전**: 자동 백업 완료 확인
4. **테스트**: 로컬 SQLite만 사용, 운영 DB는 절대 건드리지 않음

### **작업 승인 절차**
**데이터 손실 위험이 있는 작업 시:**

1. **반드시 백업 먼저 수행**
2. **한글로 사용자에게 확인 요청**
   - 예시: "이런 상황이 있어서 어쩔 수 없어요, 해도 될까요?"
   - 데이터 손실 가능성과 이유를 명확히 설명
3. **사용자 승인 후에만 진행**
4. **백업 완료를 우선시하고 진행**

### **위험한 명령어들**
```bash
# 이런 명령어들은 특히 주의!
npx prisma db push --force-reset  # 데이터 삭제됨
npx prisma migrate reset           # 모든 데이터 초기화
rm -rf prisma/                    # 데이터베이스 파일 삭제
git reset --hard                  # 커밋되지 않은 변경사항 손실
```

---

## Project Overview

This is a **School Safety Management System** (학교 안전보건 관리 시스템) built for Incheon Metropolitan Office of Education Safety Mutual Aid Association. It's a Next.js 15 application with TypeScript, using Prisma ORM with PostgreSQL database (SQLite for development), custom React Context authentication, and styled with Tailwind CSS v4.

## Development Commands

- **Development server**: `npm run dev` (starts on http://localhost:3000, auto-increments port if occupied, e.g., 3004)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`
- **Vercel build**: `npm run vercel-build` (custom build script that handles Prisma generation and database setup)
- **Database operations**: 
  - `npx prisma migrate dev --name descriptive_name` (create and apply migrations)
  - `npx prisma generate` (regenerate Prisma client)
  - `npx prisma studio` (open database browser)
  - `npx prisma db push --force-reset` (sync schema to database, used in deployment with data loss acceptance)
- **Data backup/restore**: 
  - `node scripts/backup-data.js` (backup current database to data-backup.json)
  - Use `/api/restore-data` endpoint to restore from backup file

## Architecture Overview

### Database Schema (Prisma)
- **User**: User accounts with authentication, addresses (home/office), and profile information. One-to-many with schools, schedules, and travel times
- **School**: Core entity with name, phoneNumber, contactPerson, address, linked to schedules. Special "휴무일정" dummy school exists for holiday schedules
- **Schedule**: Visit schedules with date/time, purpose (JSON array), AM/PM slots, holiday support, and one-to-one travel time relationship
- **TravelTime**: Travel time calculations linked to schedules, storing duration, distance, origin (home/office/previous school), and various time options
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
- `/travel-time` - Travel time calculation and address management page (user only)
- `/educational-materials` - Blog-style material posts with multi-file attachments (public access, admin upload)
- `/educational-materials/[id]` - Individual post detail pages with file downloads
- `/industrial-accidents` - Industrial accident documentation (public access, admin upload)
- `/industrial-accidents/[id]` - Individual post detail pages with file downloads
- `/auth/signin` - Admin login page

#### API Routes
- `/api/schools` - School CRUD operations
- `/api/schools/auto-address` - Automatic school address search using Naver Local Search API
- `/api/schedules` - Schedule management with school relations
- `/api/travel-time/calculate` - Travel time calculation using Naver Maps API (Geocoding + Direction5)
- `/api/travel-time/auto-update` - Automatic travel time updates for today's schedules (10-minute intervals)
- `/api/user/addresses` - User home/office address management
- `/api/restore-data` - Data restoration from backup files
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

#### Travel Time System
- **Fixed Company Address**: Hardcoded to "인천광역시 남동구 구월남로 232번길 31"
- **User Addresses**: Home and office addresses stored in User model, editable via travel-time page
- **Auto-Address Search**: Bulk school address population using Naver Local Search API with fallback to manual entry
- **Travel Time Calculation**: Uses Naver Maps API (Geocoding + Direction5) with realistic mock data fallback
- **Display Format**: Shows origin and duration like "이동:32분소요" in dashboard
- **Auto-Update**: Recalculates travel times every 10 minutes for today's schedules
- **Mobile Optimization**: First school shows both company/home options, subsequent schools show previous school travel times

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
- **User Pages**: `/dashboard`, `/schools`, `/schedules`, `/travel-time` - require user authentication (both regular users and super admins)
- **Admin Pages**: `/admin/*` - require super admin authentication only
- **Role Check**: `isSuperAdmin(user)` from `@/lib/authUtils` determines super admin status
- **Data Separation**: User-specific data (schools, schedules, travel times, dashboard memos) stored per user, shared data (educational materials, industrial accidents) accessible to all
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
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
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
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
```

### Google Cloud Storage Setup
- Service account with Storage Admin role
- Bucket with uniform bucket-level access disabled (for ACL-based permissions)
- CORS policy configured for direct client uploads from Vercel domains
- Files uploaded with pattern: `{category}/{timestamp}_{sanitized_filename}`
- Filename sanitization: Korean/special characters removed, length limited to 50 chars
- Public URLs: `https://storage.googleapis.com/{bucket}/{path}`

### Naver Maps API Setup
- Service registration at Naver Cloud Platform console
- Application registration with appropriate service environment
- Geocoding API and Direction5 API activation
- Client ID and Client Secret generation for API access
- Environment variables: NAVER_CLIENT_ID and NAVER_CLIENT_SECRET

### Prerequisites
- Node.js 18+ for Next.js 15 compatibility
- Google Cloud account with Storage API enabled
- Service account key for GCS access
- Naver Cloud Platform account for travel time calculations

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
- Displays travel time information with origin and duration ("이동:32분소요")
- First school shows both company and home travel options
- Subsequent schools show travel time from previous school
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

## Travel Time Management System

### Travel Time Architecture
- **Naver Maps Integration**: Uses Geocoding API for address-to-coordinates conversion and Direction5 API for route calculation
- **Mock Data Fallback**: Realistic travel time estimates when API keys aren't configured, considering regional distances and traffic patterns
- **Fixed Company Address**: "인천광역시 남동구 구월남로 232번길 31" hardcoded for consistency
- **Automatic Updates**: Background service recalculates travel times every 10 minutes for today's schedules
- **Database Storage**: TravelTime model stores duration, distance, origin type, and multiple time options per schedule

### Travel Time Calculation Logic
- **First School**: Calculate from both home and office addresses, display both options
- **Subsequent Schools**: Calculate from previous school in chronological order
- **Time Format**: Duration in minutes (e.g., "32분"), distance in kilometers (e.g., "15.2km")
- **Origin Types**: "집", "회사", or previous school name
- **Error Handling**: Falls back to mock data on API failures, provides realistic estimates based on regional patterns

### Address Management
- **Auto-Search**: Naver Local Search API finds school addresses by name with fallback message for manual entry
- **User Addresses**: Home and office addresses stored in User model, editable via travel-time page
- **Address Validation**: Input validation and sanitization for Korean addresses
- **Bulk Operations**: Update all school addresses at once or individual school addresses

## Critical TypeScript Patterns

### Schedule Interface Requirements
When working with schedules, always include optional holiday and travel time fields:
```typescript
interface Schedule {
  id: string;
  date: string;
  schoolId: string;
  school: { name: string; abbreviation?: string | null; address?: string | null; };
  ampm: string;
  startTime: string;
  endTime: string;
  purpose: string; // JSON stringified array
  otherReason?: string;
  isHoliday?: boolean;
  holidayReason?: string | null;
  travelTime?: {
    duration?: string;
    origin?: string;
    fromOfficeTime?: string;
    fromHomeTime?: string;
    toPreviousTime?: string;
  };
}
```

### TravelTime Interface Requirements
```typescript
interface TravelTime {
  id: string;
  userId: string;
  scheduleId: string;
  fromOfficeTime?: string;    // 회사에서 출발하는 시간
  fromHomeTime?: string;      // 집에서 출발하는 시간
  toPreviousTime?: string;    // 이전 학교에서 이동하는 시간
  duration?: string;          // 이동 소요 시간 (예: "32분")
  distance?: string;          // 이동 거리 (예: "15.2km")
  origin?: string;            // 출발지 (집/회사/이전학교명)
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

### 모바일 드롭다운 문제 해결

**문제 증상**: 모바일에서 자료마당 드롭다운 메뉴 항목을 터치하면 바로 닫히면서 클릭이 안 되는 문제

**원인**: 이벤트 버블링 (Event Bubbling) - 터치 이벤트가 부모 요소까지 전달되어 외부 클릭으로 인식되어 드롭다운이 즉시 닫힘

**해결책**: 
1. **터치 이벤트 제거**: 모바일에서 `touchstart` 외부 클릭 감지 이벤트 제거
2. **데스크톱 전용 외부 클릭**: `isTouchDevice()` 체크로 마우스만 있는 디바이스에서만 외부 클릭 감지
3. **햄버거 메뉴 연동**: 모바일에서는 햄버거 메뉴 닫을 때만 드롭다운 닫기
4. **페이지 이동시 자동 닫힘**: 모바일에서 페이지 이동시 햄버거 메뉴 자동 닫기

**구현 코드 (GitHub 커밋: b31cd7c, 8968bc0)**:
```typescript
// 드롭다운 외부 클릭 감지 (데스크톱만)
useEffect(() => {
  function handleOutsideClick(event: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDataCenterOpen(false);
    }
  }

  // 터치 디바이스가 아닐 때만 마우스 이벤트 처리
  if (!isTouchDevice()) {
    document.addEventListener('mousedown', handleOutsideClick);
  }
  
  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
}, []);

// 페이지 변경시 모바일 햄버거 메뉴 닫기
useEffect(() => {
  if (isTouchDevice()) {
    setIsMenuOpen(false);
    setIsDataCenterOpen(false);
  }
}, [pathname]);

// 햄버거 버튼 클릭 시 드롭다운도 함께 관리
onClick={() => {
  setIsMenuOpen(!isMenuOpen);
  // 햄버거 메뉴를 닫을 때 드롭다운도 함께 닫기
  if (isMenuOpen) {
    setIsDataCenterOpen(false);
  }
}}

// 모바일 자료마당 버튼 - 토글 기능 제거, 항상 열기만
onClick={() => setIsDataCenterOpen(true)}
```

**관련 커밋**:
- `1171afd`: 모바일 자료마당 드롭다운 토글 기능 제거
- `b31cd7c`: 모바일 자료마당 드롭다운 터치 이벤트 충돌 완전 해결
- `8968bc0`: 모바일 페이지 이동시 햄버거 메뉴 자동 닫힘 기능 추가

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

### Travel Time API Issues

**Mock Data Usage:**
- API automatically falls back to mock data when NAVER_CLIENT_ID/NAVER_CLIENT_SECRET are missing
- Mock data provides realistic estimates based on regional distance patterns and traffic considerations
- Console warnings indicate when mock data is being used instead of real API calls

**Naver API Errors:**
- **API Key Issues**: Check NAVER_CLIENT_ID and NAVER_CLIENT_SECRET are correctly set in environment variables
- **Service Registration**: Ensure Geocoding API and Direction5 API are activated in Naver Cloud Platform console
- **Rate Limiting**: Naver APIs have usage quotas; check console for quota exceeded errors
- **Address Not Found**: Auto-address search falls back to manual entry message when school names don't match Naver database

**Travel Time Calculation Problems:**
- **No Travel Times Displayed**: Check if today's schedules exist and TravelTime records are created via auto-update API
- **Inconsistent Times**: Mock data includes realistic variance; real API provides accurate route-based calculations
- **Missing Addresses**: User home/office addresses must be set via travel-time page for calculations to work

## 2025년 8월 22일 주요 업데이트 (완료된 기능들)

### 🎯 포토카드 모달 미리보기 시스템
**위치**: `src/components/PhotoCardManager.tsx`

- **기능**: 중대재해 알리미 포토카드 클릭 시 대형 모달로 이미지 미리보기
- **모달 설계**: 전체화면 오버레이 (`max-w-6xl`, `max-h-[95vh]`)
- **이미지 표시**: `max-h-[70vh]` + `object-contain`으로 잘림 없는 전체 이미지 표시
- **다중 파일 지원**: 하나의 자료에 여러 첨부파일이 있을 때 모두 미리보기 가능
- **다운로드 기능**: 모달 내에서 직접 파일 다운로드 버튼 제공
- **메타데이터 표시**: 업로드 날짜, 업로더, 파일 정보 등 상세 정보 표시

```typescript
// 모달 트리거
onClick={() => {
  setSelectedMaterial(material);
  setIsModalOpen(true);
}}

// 이미지 최적화 표시
<Image
  className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
  unoptimized={true}
/>
```

### 📱 모바일 로그아웃 버튼 개선
**위치**: `src/components/Navbar.tsx`

- **배치**: 모바일 상단 네비바 우측 (사용자명 + 로그아웃 + 햄버거 순서)
- **디자인**: 작은 빨간 그라데이션 버튼 (`px-2 py-1`, `text-xs`)
- **반응형**: `md:hidden`으로 모바일에서만 표시
- **중복 제거**: 모바일 드롭다운 메뉴에서 기존 로그아웃 버튼 제거
- **접근성**: 로그인한 사용자만 표시, 방문자는 기존 레이아웃 유지

```typescript
{isLoggedIn ? (
  <>
    <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-full">
      <span className="text-gray-300 text-xs">{getUserDisplayName(user)}</span>
    </div>
    <button onClick={logout} className="px-2 py-1 bg-gradient-to-r from-red-500...">
      로그아웃
    </button>
  </>
) : (/* 기존 햄버거 메뉴 */)}
```

### 🔐 GCS Access Denied 오류 완전 해결
**문제**: 기존 업로드 파일들이 Google Cloud Storage에서 비공개 상태로 "Access denied" 오류 발생

**해결책 1**: 메타데이터 API 개선 (`src/app/api/materials/metadata/route.ts`)
```typescript
// publicUrl에서 버킷 내 파일 경로 정확히 추출
const bucketPath = attachment.filePath || attachment.publicUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '');
const file = bucket.file(bucketPath);

// makePublic() + ACL 폴백 방식으로 확실한 공개 설정
try {
  await file.makePublic();
} catch (publicError) {
  await file.acl.add({ entity: 'allUsers', role: 'READER' });
}
```

**해결책 2**: 기존 파일 일괄 공개 API (`src/app/api/materials/make-public/route.ts`)
- **용도**: 기존 업로드된 모든 파일을 한 번에 공개로 설정
- **결과**: 26개 파일 성공적으로 공개 설정 완료
- **안전장치**: 각 파일별 성공/실패 개수와 오류 상세 정보 제공

**해결책 3**: 관리자용 UI 페이지 (`src/app/admin/fix-files/page.tsx`)
- **접근**: `/admin/fix-files` (관리자 전용)
- **기능**: "기존 파일들 공개로 설정하기" 버튼 클릭으로 간편 실행
- **UI**: 경고 메시지, 진행 상황, 실행 결과를 사용자 친화적으로 표시
- **보안**: `isSuperAdmin()` 체크로 관리자만 접근 가능

### 🚀 배포 및 테스트 결과
- **최종 배포 URL**: https://school-safety-manager-pgsbicaab-ksh9958s-projects.vercel.app
- **테스트 완료**: 
  - ✅ 포토카드 모달 이미지 전체 표시 (잘림 현상 해결)
  - ✅ 모바일 로그아웃 버튼 정상 작동
  - ✅ 기존 26개 파일 다운로드 정상 작동 (Access Denied 오류 해결)
  - ✅ 새 파일 업로드 시 자동 공개 설정 적용

### 🛠 기술적 주요 개선사항

**1. 모달 이미지 표시 최적화**
- 모달 크기: `max-w-4xl` → `max-w-6xl` (화면 활용도 증대)
- 이미지 컨테이너: `flex items-center justify-center` (중앙 정렬)
- 이미지 크기: `max-h-[60vh]` → `max-h-[70vh]` (더 큰 미리보기)
- 비율 유지: `object-contain` + `w-auto h-auto` (잘림 방지)

**2. GCS 파일 권한 관리 시스템**
- 업로드 시점 자동 공개 설정 (metadata API)
- 기존 파일 일괄 공개 처리 (make-public API)
- 이중 안전장치: `makePublic()` 실패 시 ACL 방식 폴백

**3. 모바일 UX 개선**
- 상단 네비바에 로그아웃 접근성 향상
- 화면 공간 효율적 사용 (작은 버튼 디자인)
- 중복 UI 요소 제거로 깔끔한 인터페이스

### 📋 운영 관리 가이드

**파일 다운로드 문제 발생 시**:
1. 관리자 로그인 후 `/admin/fix-files` 페이지 접속
2. "기존 파일들 공개로 설정하기" 버튼 클릭
3. 결과 확인 후 사용자에게 재시도 안내

**새로운 기능 테스트 방법**:
1. 포토카드 모달: 중대재해 알리미 → 카드 클릭 → 이미지 전체 표시 확인
2. 모바일 로그아웃: 모바일 화면에서 상단 우측 로그아웃 버튼 확인
3. 파일 다운로드: 기존 자료들 다운로드가 정상 작동하는지 확인

**향후 유지보수 포인트**:
- 새로운 파일 업로드 시 자동 공개 설정이 정상 작동하는지 모니터링
- GCS 버킷 권한 정책 변경 시 make-public API 재실행 필요할 수 있음
- 모달 이미지 표시가 다양한 해상도에서 올바르게 작동하는지 주기적 확인