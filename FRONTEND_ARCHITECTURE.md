# Frontend Architecture Documentation

This document outlines the frontend structure of the AI Resume Builder application. It is designed to help developers understand the component hierarchy, state management, and key interactions to facilitate cloning or recreating the frontend.

## 1. Project Structure Overview

The project uses **Next.js 14 (App Router)** with **TypeScript** and **Tailwind CSS**.

```
app/
├── layout.tsx        # Root layout (Auth provider, global styles)
├── page.tsx          # Main Application Controller (Single Page App feel)
├── globals.css       # Global Tailwind imports
├── editor.css        # Custom styles for the rich text editor
└── api/              # Backend API routes (Next.js API)

components/
├── Dashboard.tsx     # User dashboard view
├── Sidebar.tsx       # Main navigation sidebar
├── ResumePreview.tsx # Visual resume builder wrapper
├── ATSScoreCard.tsx  # ATS analysis results panel
├── ExportModal.tsx   # Download/Export dialog
├── TemplateSelector.tsx # Template switcher modal
└── templates/        # Resume template definitions
    ├── index.ts      # Template registry
    ├── TemplateComponents.tsx # Shared editable components
    └── [TemplateName].tsx     # Individual template layouts
```

## 2. Core Application Logic (`app/page.tsx`)

The `page.tsx` file serves as the central hub for the application. It is a client-side component (`'use client'`) that manages the entire application state.

### Key State Variables
- **`activeTab`**: Controls the main view (`'dashboard'`, `'editor'`, `'templates'`, `'settings'`).
- **`builderMode`**: Boolean. Toggles between the **Rich Text Editor** (raw HTML) and the **Visual Builder** (structured data).
- **`resumeData`**: The structured JSON object containing resume details (Contact, Experience, Education, etc.). Used in Builder Mode.
- **`editorContent`**: The raw HTML string of the resume. Used in Text Editor Mode.
- **`jobDescription`**: Stores the target job description for AI tailoring.

### Key Features Implemented in `page.tsx`
1.  **File Upload**: Handles parsing PDF/DOCX files using `mammoth` (for DOCX) or custom API routes.
2.  **Mode Switching**:
    -   *Editor -> Builder*: Triggers an AI extraction process to convert raw text into structured JSON (`resumeData`).
    -   *Builder -> Editor*: (Currently resets to text mode).
3.  **AI Tailoring**: Sends content + JD to the backend to generate optimized content.
4.  **Printing/Exporting**: Handles CSS print media queries to generate PDFs.

## 3. Component Breakdown

### A. Navigation (`Sidebar.tsx`)
A static vertical sidebar that updates the `activeTab` state in the parent component. It integrates with Clerk (`<UserButton />`) for user profile management.

### B. Dashboard (`Dashboard.tsx`)
The landing view for authenticated users.
-   **Functionality**: Fetches and displays a grid of user's saved resumes.
-   **UI**: Shows thumbnails (CSS placeholders) and ATS scores.
-   **Interactions**: Clicking a resume triggers the `onEdit` callback to switch the main view to the Editor.

### C. The Editor Workspace
This is the most complex part of the UI, split into three main areas:

1.  **Center Stage (The Resume)**:
    -   **Text Mode**: Renders `ReactQuill` (a rich text editor).
    -   **Builder Mode**: Renders `<ResumePreview />`.
    -   **Review Mode**: A split-screen view comparing "Original" vs "Tailored" content.

2.  **Right Panel (Tools)**:
    -   **Job Description Tab**: Text area for pasting JD and "Scan for Match" button.
    -   **Analysis Tab**: Renders `<ATSScoreCard />` to show keyword matches and missing skills.

3.  **Toolbar (Top)**:
    -   Contains actions like "Save", "Export", "Sync from Editor", and the Template Selector trigger.

### D. Visual Builder (`ResumePreview.tsx` & `templates/`)
This system allows users to edit their resume visually.

-   **`ResumePreview.tsx`**: A wrapper that accepts `resumeData` and a `templateName`. It dynamically imports the correct template component.
-   **Template Architecture**:
    -   Each template (e.g., `ModernTemplate.tsx`) receives `data` and `onUpdate` props.
    -   **Editable Fields**: Templates use helper components from `TemplateComponents.tsx` (like `EditableText`, `EditableList`) which turn into input fields when clicked.
    -   **Updates**: When a user edits a field, the change bubbles up to `page.tsx` via `onUpdate`, updating the global `resumeData` state.

### E. ATS Analysis (`ATSScoreCard.tsx`)
Displays the results of the AI analysis.
-   **Visuals**: Uses a circular progress bar for the score.
-   **Interactions**: Clicking a "Missing Keyword" triggers a request to generate a bullet point incorporating that keyword.

## 4. Styling & Theming
-   **Tailwind CSS**: Used for 99% of styling.
-   **Print Styling**: The application relies on `@media print` CSS rules. When "Export PDF" is clicked, the app triggers `window.print()`. The CSS ensures only the resume container is visible, hiding the sidebar and toolbars.
-   **Dynamic Colors**: The `accentColor` state is passed down to templates to allow real-time color theming.

## 5. Data Flow Summary

1.  **User Uploads File** -> `page.tsx` parses text -> Sets `editorContent`.
2.  **User Clicks "Builder Mode"** -> `page.tsx` sends text to `/api/extract-data` -> Returns JSON -> Sets `resumeData` -> Renders `<ResumePreview />`.
3.  **User Edits Visual Resume** -> `EditableText` component fires `onChange` -> Updates `resumeData` -> Re-renders Template.
4.  **User Clicks "Scan"** -> Sends `editorContent` + `jobDescription` to `/api/analyze-ats` -> Returns Analysis Object -> Renders `<ATSScoreCard />`.

## 6. Cloning Instructions
To recreate this frontend:
1.  **Scaffold**: Create a Next.js app with Tailwind.
2.  **Dependencies**: Install `lucide-react` (icons), `react-quill` (editor), `framer-motion` (animations), `html2canvas` or `jspdf` (optional, if not using native print).
3.  **Copy Components**: Replicate the `components/` folder structure.
4.  **State Logic**: Copy the state management logic from `app/page.tsx`.
5.  **Templates**: Ensure the `templates/` folder is modular so you can easily add new designs.
