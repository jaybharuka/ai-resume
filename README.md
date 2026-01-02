# Resumex

An AI-powered resume workspace built with Next.js 14. Create professional LaTeX resumes, tailor them for job descriptions, and get ATS optimization — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🏠 Dashboard
- **Quick Tour**: Interactive 3-step onboarding for new users
- **Getting Started Cards**: Easy access to create resume, upload existing, or open LaTeX workspace
- **Recent Resumes**: Quick access to your saved resumes with timestamps

### 📝 Resume Editor
- **Visual Builder**: Form-based editor with real-time preview
- **Resume Templates**: Multiple professional templates to choose from
- **Job Description Input**: Paste JD and get AI-powered tailoring suggestions
- **ATS Score Analysis**: See how well your resume matches the job description

### 🎨 LaTeX Pro Workspace
- **Code Editor**: Full Monaco editor with LaTeX syntax highlighting
- **Visual Editor**: User-friendly form-based editing (light theme)
- **Real-time PDF Preview**: Instant compilation with Tectonic
- **AI Assistant**: Tailor sections, improve content, optimize for ATS
- **Section Preview**: Preview AI changes before applying

### 🤖 AI-Powered Features
- **Resume Tailoring**: Rewrite sections to match job descriptions
- **ATS Optimization**: Optimize content for Applicant Tracking Systems
- **Summary Generation**: Generate professional summaries
- **Content Improvement**: Enhance clarity and impact of bullet points

### ⚙️ Settings
- **AI Preferences**: Control AI strictness level (Conservative, Balanced, Creative)
- **Resume Layout**: Set preferred resume length (1 page, 2 pages, auto)
- **Editor Preferences**: Choose default editor (Visual or Code)
- **Export Settings**: Set default export format (PDF, LaTeX, DOCX)
- **Danger Zone**: Clear all saved data and restart fresh

### 📤 Export Options
- PDF (high-quality LaTeX-rendered)
- LaTeX source (.tex file)
- DOCX (Microsoft Word)

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14 (App Router) |
| **UI** | React 18.3, Tailwind CSS, Radix UI |
| **State** | Zustand with localStorage persistence |
| **Editor** | Monaco Editor |
| **PDF** | Tectonic compiler, react-pdf |
| **AI** | Google Gemini, Anthropic Claude |
| **Icons** | Lucide React |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/jaybharuka/ai-resume.git
cd ai-resume

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
```env
GEMINI_API_KEY="your-gemini-api-key"
CLAUDE_API_KEY="your-claude-api-key"  # Optional
```

### Run the App

```bash
npm run dev
```

Open [http://localhost:3004](http://localhost:3004)

## 📁 Project Structure

```
ai-resume/
├── app/
│   ├── api/                 # API routes for AI, compilation, etc.
│   ├── create-resume/       # Create new resume flow
│   ├── latex/               # LaTeX Pro workspace
│   ├── settings/            # Settings page
│   └── page.tsx             # Main editor page
├── components/
│   ├── latex/               # LaTeX workspace components
│   │   └── visual/          # Visual editor components
│   ├── templates/           # Resume template components
│   ├── Dashboard.tsx        # Main dashboard
│   ├── Sidebar.tsx          # Navigation sidebar
│   └── GlobalLayout.tsx     # App layout wrapper
├── lib/
│   ├── latex/               # LaTeX utilities & templates
│   ├── stores/              # Zustand state stores
│   └── resume/              # Resume utilities
├── bin/
│   └── tectonic.exe         # LaTeX compiler
└── types/
    └── resume.ts            # TypeScript interfaces
```

## 🔧 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/compile-latex` | Compile LaTeX to PDF |
| `/api/generate-latex` | Generate LaTeX from JSON |
| `/api/tailor-resume` | AI-powered resume tailoring |
| `/api/preview-section` | Preview AI changes |
| `/api/generate-summary` | Generate AI summary |
| `/api/analyze-ats` | ATS score analysis |
| `/api/extract-data` | Extract data from uploaded resume |

## 🐳 Docker

```bash
# Build the image
docker build -t ai-resume .

# Run the container
docker run -p 3004:3004 ai-resume
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using Next.js
