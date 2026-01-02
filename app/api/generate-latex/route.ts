import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const { resumeData, jobDescription } = await request.json();

    if (!resumeData || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume Data and Job Description are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
SYSTEM MESSAGE:
You are an expert LaTeX Resume Engineer and ATS Optimization Specialist.
Your task is to generate a high-quality, single-page, ATS-optimized LaTeX resume based on the provided JSON data and Job Description.

CRITICAL: You must strictly follow the formatting guide below. Do not deviate from these LaTeX commands and structure.

# LATEX FORMATTING GUIDE (STRICTLY FOLLOW)

## 1. Document Class & Setup
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\usepackage{xcolor}

## 2. Page & Text Formatting
\\pagenumbering{gobble}
\\setlength{\\parindent}{0pt}
\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=blue,
}

## 3. Section Formatting
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{10pt}{6pt}

## 4. List Formatting
\\setlist[itemize]{leftmargin=*, nosep, topsep=2pt}

## 5. Header Structure (Centered)
\\begin{center}
    {\\LARGE \\textbf{NAME}} \\\\
    \\vspace{4pt}
    PHONE $|$ EMAIL $|$ \\href{LINKEDIN_URL}{linkedin.com/in/username} $|$ \\href{GITHUB_URL}{github.com/username}
\\end{center}

## 6. Content Formatting Rules
- **Section Headers**: Use \\section*{SECTION NAME} (Education, Experience, Projects, Skills, Certifications)
- **Job Titles**: \\textbf{Role Title} \\hfill \\textit{Start Date -- End Date}
- **Company**: \\textit{Company Name, Location}
- **Bullets**: Use \\begin{itemize} ... \\end{itemize}
- **Tech Stack**: \\textbf{Project Name} $|$ \\textit{Tech1, Tech2, Tech3}
- **Inline Categories**: \\textbf{Category:} Item1, Item2
- **Spacing**: Use \\vspace{4pt} between items if needed, but rely on \\titlespacing and \\setlist for consistency.

## 7. ATS Optimization Rules
- NO \\usepackage{tabularx}, \\usepackage{multicol}, \\usepackage{graphicx}, \\usepackage{fancyhdr}
- NO columns, tables, or images.
- Use standard fonts (default Computer Modern is fine).

## 8. CRITICAL: Character Escaping
- You MUST escape the following characters in all text content: & % $ # _ { } ~ ^
- **ESPECIALLY "&"**: Since tables are forbidden, the "&" character is ALWAYS a text symbol and MUST be escaped as "\\&".
- Example: "C++ & Java" $\to$ "C++ \\& Java"
- Example: "100%" $\to$ "100\\%"
- Example: "$50k" $\to$ "\\$50k"
- Do NOT use "&" for alignment. Use \\hfill if you need to separate left/right content.

# CONTENT GENERATION INSTRUCTIONS

1. **Analyze the Job Description**: Extract keywords, required skills, and seniority level.
2. **Tailor the Resume**:
   - Rewrite summary to align with the JD.
   - Rewrite bullet points using the pattern: [Action Verb] + [What] + [How] + [Impact with Metrics].
   - Prioritize relevant experience and projects.
   - Ensure keywords from the JD are naturally embedded.
3. **Formatting**:
   - Fit everything on ONE PAGE.
   - Use the exact LaTeX commands defined above.
   - **DOUBLE CHECK**: Did you escape every "&" character?

# INPUT DATA
Resume JSON: ${JSON.stringify(resumeData)}
Job Description: ${JSON.stringify(jobDescription)}

# CRITICAL: SECTION ORDER
If the Resume JSON contains a "sectionOrder" array, you MUST respect that order for the sections in the generated LaTeX.
If "sectionOrder" is missing, use the standard order: Summary, Education, Experience, Projects, Skills.

# OUTPUT
Return ONLY the raw LaTeX code. Start with \\documentclass and end with \\end{document}. Do not include markdown code blocks or explanations.
`;



    const result = await model.generateContent(prompt);
    const response = await result.response;
    let latexCode = response.text();
    
    // Clean up markdown code blocks if present
    latexCode = latexCode.replace(/```latex/g, '').replace(/```/g, '');
    
    // Post-processing: Safety net for unescaped & characters
    // Since we forbid tables, any unescaped & is likely an error.
    // We look for & that is NOT preceded by \
    latexCode = latexCode.replace(/(?<!\\)&/g, '\\&');


    // Cleanup if the model returns markdown code blocks
    latexCode = latexCode.replace(/^```latex\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    return NextResponse.json({ latexCode });
  } catch (error) {
    console.error('Error generating LaTeX:', error);
    return NextResponse.json(
      { error: 'Failed to generate LaTeX' },
      { status: 500 }
    );
  }
}
