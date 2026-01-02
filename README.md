# AI Resume Tailor

A powerful, AI-powered resume builder and tailoring application built with Next.js 14. Create professional LaTeX-rendered resumes, tailor them for specific job descriptions, and export to multiple formats.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 📝 Dual Editor Mode
- **Code Editor**: Full Monaco editor for direct LaTeX editing with syntax highlighting
- **Visual Editor**: User-friendly form-based editor for non-technical users
- Seamless switching between modes with automatic data synchronization

### 🤖 AI-Powered Features
- **Section Tailoring**: Rewrite resume sections to match job descriptions
- **ATS Optimization**: Optimize content for Applicant Tracking Systems
- **AI Summary Generation**: Generate professional summaries based on your experience
- **Content Improvement**: Enhance clarity and impact of your bullet points
- **Plain Text Preview**: Review AI suggestions in readable format before applying

### 📄 LaTeX Resume Generation
- Real-time PDF preview with Tectonic compiler
- Multiple professional LaTeX templates
- Section-by-section editing and preview
- Automatic LaTeX escaping and formatting

### 📤 Export Options
- **PDF**: High-quality LaTeX-rendered PDF output
- **LaTeX Source**: Download `.tex` file for further editing
- **DOCX**: Microsoft Word format (coming soon)

### 📥 Import Support
- Upload existing PDF resumes
- Upload DOCX files
- Automatic data extraction using AI

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18.3
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **PDF Viewing**: react-pdf with PDF.js
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **LaTeX Compiler**: Tectonic (bundled binary)
- **AI Integration**: 
  - Google Gemini (gemini-2.0-flash-exp)
  - Anthropic Claude
- **PDF Parsing**: pdf-to-png-converter, pdfjs-dist
- **Document Processing**: mammoth (DOCX), docx (export)

### Development
- **Language**: TypeScript
- **Linting**: ESLint
- **CSS Processing**: PostCSS, Autoprefixer

## 📁 Project Structure

```
ai-resume/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── ai-action/            # AI-powered actions
│   │   ├── analyze-ats/          # ATS score analysis
│   │   ├── compile-latex/        # LaTeX compilation
│   │   ├── convert-to-latex/     # Plain text to LaTeX
│   │   ├── extract-data/         # Resume data extraction
│   │   ├── generate-latex/       # LaTeX generation
│   │   ├── generate-summary/     # AI summary generation
│   │   ├── preview-section/      # Section preview (plain text)
│   │   └── ...
│   ├── latex/                    # LaTeX workspace page
│   └── page.tsx                  # Home page
├── components/
│   ├── latex/                    # LaTeX workspace components
│   │   ├── visual/               # Visual editor components
│   │   │   └── VisualEditor.tsx  # Form-based resume editor
│   │   ├── LatexEditor.tsx       # Monaco code editor
│   │   ├── LatexPreview.tsx      # PDF preview component
│   │   ├── LatexTools.tsx        # Tools panel
│   │   └── SectionPreviewModal.tsx # AI preview modal
│   └── templates/                # Resume templates
├── lib/
│   ├── latex/                    # LaTeX utilities
│   │   ├── flexibleGenerator.ts  # LaTeX code generation
│   │   ├── latexAdapter.ts       # JSON ↔ LaTeX conversion
│   │   ├── sectionParser.ts      # Section extraction/replacement
│   │   └── templates/            # LaTeX templates
│   └── stores/                   # Zustand stores
│       └── resumeStore.ts        # Global resume state
├── types/
│   └── resume.ts                 # TypeScript interfaces
├── bin/
│   └── tectonic.exe              # LaTeX compiler binary
└── public/                       # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key (for AI features)
- Claude API key (optional, for advanced AI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-resume.git
   cd ai-resume
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   CLAUDE_API_KEY="your-claude-api-key"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3004](http://localhost:3004)

## 📖 Usage Guide

### Creating a New Resume

1. **Upload Existing Resume**: 
   - Click "Upload Resume" and select a PDF or DOCX file
   - AI will extract all data automatically

2. **Start from Scratch**:
   - Use the Visual Editor to fill in your information
   - Switch to Code Editor for advanced LaTeX editing

### Using AI Section Tailoring

1. **Enter Job Description**: Paste the target job description in the tools panel
2. **Select Section**: Choose which section to tailor (Experience, Skills, etc.)
3. **Choose Action**:
   - **Rewrite for JD**: Align content with job requirements
   - **Improve Clarity**: Enhance readability
   - **Optimize for ATS**: Add relevant keywords
   - **Shorten**: Condense content
4. **Preview Changes**: Review AI suggestions in plain text
5. **Apply Changes**: Click "Apply" to update LaTeX and recompile PDF

### Editing Modes

#### Visual Editor
- Form-based interface for easy editing
- Collapsible sections for each resume part
- Add/remove items with click of a button
- Undo functionality for all changes

#### Code Editor
- Full Monaco editor with LaTeX syntax highlighting
- Direct control over LaTeX source
- Auto-compilation on changes
- Outline panel for quick navigation

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/compile-latex` | POST | Compile LaTeX to PDF |
| `/api/extract-data` | POST | Extract data from uploaded resume |
| `/api/generate-latex` | POST | Generate LaTeX from JSON data |
| `/api/preview-section` | POST | Get AI-improved section (plain text) |
| `/api/convert-to-latex` | POST | Convert plain text to LaTeX |
| `/api/generate-summary` | POST | Generate AI professional summary |
| `/api/analyze-ats` | POST | Analyze ATS compatibility |

## 🎨 Resume Data Structure

```typescript
interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    website?: string;
    location?: string;
  };
  summary?: string;
  experience?: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    bullets: string[];
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    graduationDate?: string;
    gpa?: string;
    honors?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  awards?: Array<{ title: string; issuer?: string; date?: string }>;
  languages?: string[];
  customSections?: Array<{
    title: string;
    content?: string;
    items?: string[];
  }>;
}
```

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `CLAUDE_API_KEY` | No | Anthropic Claude API key |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | No | NextAuth.js secret |

## 📜 Scripts

```bash
# Development
npm run dev          # Start dev server on port 3004

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🐳 Docker Support

```bash
# Build image
docker build -t ai-resume .

# Run container
docker run -p 3004:3004 ai-resume
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tectonic](https://tectonic-typesetting.github.io/) - LaTeX compiler
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Lucide](https://lucide.dev/) - Icons

---

Built with ❤️ using Next.js and AI
