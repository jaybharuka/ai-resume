# Backend & Utilities Documentation

This document outlines the backend architecture, API routes, database schema, and utility functions of the AI Resume Builder. Use this guide alongside `FRONTEND_ARCHITECTURE.md` to rebuild the complete application.

## 1. Technology Stack

-   **Framework**: Next.js 14 (App Router)
-   **Database**: SQLite (via Prisma ORM)
-   **AI Provider**: Google Gemini (`gemini-2.0-flash-exp`)
-   **Authentication**: Clerk
-   **File Processing**: `mammoth` (DOCX), `pdf-parse` (PDF)

## 2. Database Schema (`prisma/schema.prisma`)

The application uses a simple relational model to store user data and resumes.

### Models
1.  **`User`**:
    -   `id`: String (Matches Clerk User ID)
    -   `email`: String (Unique)
    -   `resumes`: Relation to `Resume` model
    -   `applications`: Relation to `JobApplication` model

2.  **`Resume`**:
    -   `id`: String (CUID)
    -   `userId`: Foreign Key to `User`
    -   `title`: String (e.g., "Software Engineer Resume")
    -   `content`: String (Stores the raw HTML or JSON string)
    -   `atsScore`: Int (Last calculated score)
    -   `createdAt` / `updatedAt`: Timestamps

3.  **`JobApplication`** (Planned Feature):
    -   Tracks job applications with status (SAVED, APPLIED, etc.).

## 3. API Routes (`app/api/`)

All API routes are located in `app/api/` and handle server-side logic, primarily interfacing with the Google Gemini AI.

### A. Resume Extraction (`/api/extract-data`)
-   **Method**: `POST`
-   **Input**: `{ text: string }` OR `{ base64: string, mimeType: string }` OR `{ html: string }`
-   **Function**:
    1.  Receives raw resume content (text, PDF base64, or HTML).
    2.  Constructs a prompt for Gemini to extract data into a **strict JSON schema**.
    3.  Schema includes: `personalInfo`, `experience`, `education`, `skills`, `projects`, and `customSections`.
-   **Output**: JSON object matching the `ResumeData` interface.

### B. ATS Analysis (`/api/analyze-ats`)
-   **Method**: `POST`
-   **Input**: `{ html: string, jobDescription: string }`
-   **Function**:
    1.  Sends the resume HTML and Job Description to Gemini.
    2.  Gemini evaluates the resume based on 4 criteria:
        -   Keyword Match (0-40 pts)
        -   Impact Score (0-30 pts)
        -   Formatting Check (0-15 pts)
        -   Brevity Score (0-15 pts)
    3.  Returns a structured analysis with a total score and feedback.
-   **Output**: JSON object with scores, missing keywords, and feedback.

### C. Resume Tailoring (`/api/tailor-html`)
-   **Method**: `POST`
-   **Input**: `{ html: string, jobDescription: string }`
-   **Function**:
    1.  Instructs Gemini to rewrite the resume content to match the JD.
    2.  **Constraint**: Must preserve the exact HTML structure (tags, classes).
    3.  **Feature**: Wraps changed text in `<span style="background-color: #dcfce7">` for highlighting.
-   **Output**: `{ tailoredHtml: string }`

### D. Bullet Point Generation (`/api/generate-bullet`)
-   **Method**: `POST`
-   **Input**: `{ keyword: string }`
-   **Function**: Generates a professional resume bullet point demonstrating the given skill/keyword.
-   **Output**: `{ bulletPoint: string }`

### E. Export (`/api/export-docx`)
-   **Method**: `POST`
-   **Input**: `{ html: string }`
-   **Function**: Converts the HTML content into a downloadable `.docx` file.
-   **Output**: Binary blob (Word Document).

## 4. Utility Functions (`lib/`)

### A. Database Client (`lib/prisma.ts`)
-   Initializes and exports the global `PrismaClient` instance to prevent multiple connections in development.

### B. Server Actions (`lib/actions/resume.ts`)
-   **`saveResume(data, title)`**:
    -   Upserts a `User` record (if missing).
    -   Creates or updates a `Resume` record in the database.
-   **`getUserResumes()`**:
    -   Fetches all resumes belonging to the current authenticated user (via Clerk `auth()`).

## 5. Authentication & Middleware

### `middleware.ts`
-   Uses `@clerk/nextjs` to protect routes.
-   **Config**:
    -   Public Routes: Landing page, sign-in, sign-up.
    -   Protected Routes: `/dashboard`, `/editor`, and all API routes (implicitly protected by logic checking for user).

## 6. Environment Variables (`.env`)

To run this backend, you need the following keys:

```env
# Database
DATABASE_URL="file:./dev.db"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google Gemini
GEMINI_API_KEY="AIza..."
```

## 7. Rebuilding Instructions

1.  **Setup Database**:
    -   Run `npx prisma generate` to create the client.
    -   Run `npx prisma db push` to create the SQLite file.
2.  **API Keys**: Get a free API key from Google AI Studio for Gemini.
3.  **Clerk**: Create a new Clerk application and copy the keys.
4.  **Dependencies**: Install `@google/generative-ai`, `@prisma/client`, `mammoth`, `pdf-parse`.
