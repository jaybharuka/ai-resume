# User Journey & Workflow Documentation

This document details the step-by-step workflow a user experiences when using the AI Resume Builder. It is intended to help developers understand the application flow from the user's perspective.

## Phase 1: Onboarding & Authentication
1.  **Landing**: The user arrives at the application.
2.  **Authentication**:
    -   If unauthenticated, the user sees "Sign In" / "Sign Up" buttons (handled by Clerk).
    -   Upon signing in, they are redirected to the **Dashboard**.

## Phase 2: Resume Initialization
From the Dashboard, the user has two primary actions:
1.  **Edit Existing**: Click on a resume card to open the Editor with previously saved data.
2.  **Create New**: Click "New Resume" to open a blank Editor.

### The Editor Interface
The user starts in **"Editor Mode"** (Rich Text View).
-   **Upload**: The user can upload an existing resume (`.docx` or `.pdf`).
    -   *System Action*: The app parses the file (using `mammoth` for DOCX or custom PDF parsing) and populates the rich text editor with the content.
-   **Manual Entry**: Alternatively, the user can type or paste their resume content directly into the editor.

## Phase 3: AI Tailoring (The Core Loop)
This is the primary value proposition: optimizing a resume for a specific job.

1.  **Input Job Description**: The user opens the "Job Description" tab in the right panel and pastes the target job posting.
2.  **Scan for Match**: The user clicks the "Scan for Match" button.
    -   *System Action*: The app sends the current resume HTML and the JD to `/api/tailor-html`.
3.  **Review Changes**:
    -   The interface switches to a **Split View**.
    -   **Left**: Original Resume.
    -   **Right**: Tailored Resume with AI-suggested changes highlighted in green.
4.  **Decision**:
    -   **Discard**: Reverts to the original text.
    -   **Accept Changes**: Overwrites the editor content with the tailored version.

## Phase 4: Visual Design (Builder Mode)
Once the content is finalized, the user switches to **"Builder Mode"** to format the document.

1.  **Toggle Mode**: The user clicks the "Builder" toggle at the top.
    -   *System Action*: If this is the first switch, the app sends the unstructured text to `/api/extract-data`. The AI converts the text into a structured JSON object (`ResumeData`).
2.  **Template Selection**:
    -   The user clicks the template name (e.g., "Modern") to open the **Template Selector**.
    -   They can choose from 8+ designs (Modern, Executive, Minimalist, Glitch, etc.).
3.  **Customization**:
    -   **Color**: The user picks an accent color using the color picker.
    -   **Inline Editing**: The user can click directly on text in the preview (e.g., a bullet point or header) to edit it. These changes update the underlying JSON state immediately.

## Phase 5: ATS Optimization
At any point, the user can check how well their resume performs.

1.  **Analyze**: The user switches to the "ATS Analysis" tab in the right panel.
    -   *System Action*: The app sends the content and JD to `/api/analyze-ats`.
2.  **View Results**:
    -   **Score**: A score out of 100 is displayed.
    -   **Breakdown**: Scores for Keyword Match, Impact, Formatting, and Brevity.
    -   **Missing Keywords**: A list of critical skills found in the JD but missing from the resume.
3.  **Fix Gaps**:
    -   The user clicks a "Missing Keyword" chip.
    -   *System Action*: The app generates a suggested bullet point incorporating that keyword (`/api/generate-bullet`).
    -   The user copies this bullet and adds it to their resume.

## Phase 6: Finalization & Export
1.  **Save**: The user clicks "Save" to persist the current state (JSON data) to the database.
2.  **Export**:
    -   **PDF**: The user clicks "Export PDF". The browser's print dialog opens with print-specific CSS applied, generating a clean PDF.
    -   **DOCX**: The user clicks "Export DOCX" (available in Editor mode) to download an editable Word document.
