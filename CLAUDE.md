# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **School Safety Management System** (학교 안전보건 관리 시스템) built for Incheon Metropolitan Office of Education Safety Mutual Aid Association. It's a Next.js 15 application with TypeScript, using Prisma ORM with SQLite database, and styled with Tailwind CSS v4.

## Development Commands

- **Development server**: `npm run dev` (starts on http://localhost:3000)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`
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

### Application Structure

#### Core Pages
- `/` - Dashboard with calendar view, today's schedule, monthly summaries
- `/schools` - School management (CRUD operations)
- `/schedules` - Schedule management with calendar interface  
- `/educational-materials` - File uploads for educational content
- `/industrial-accidents` - Industrial accident documentation

#### API Routes
- `/api/schools` - School CRUD operations
- `/api/schedules` - Schedule management with school relations
- `/api/materials` - File upload/retrieval with category filtering

#### Key Components
- **Navbar**: Navigation with active route highlighting
- **MaterialGrid/MaterialManager**: File upload and display with thumbnails
- **Header**: Reusable page headers

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
Materials support categories ("교육자료", "산업재해") with optional thumbnail paths for display.

## Development Guidelines

### Database Changes
Always create Prisma migrations for schema changes:
```bash
npx prisma migrate dev --name descriptive_name
npx prisma generate
```

### API Error Handling
All API routes include Prisma error handling for common scenarios (P2002 unique constraint, P2025 not found).

### TypeScript Configuration
- Uses Next.js TypeScript setup with strict mode
- Path aliases: `@/*` maps to `./src/*`
- Prisma client types available from `src/generated/prisma`

### Styling Conventions
- Tailwind CSS v4 with custom configuration
- Korean language support (lang="ko")
- Responsive design patterns for mobile compatibility

## Environment Setup

The application expects:
- `DATABASE_URL` environment variable for Prisma (defaults to local SQLite)
- Node.js 18+ for Next.js 15 compatibility
- File upload directory structure for materials management