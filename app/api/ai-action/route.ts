import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const { action, latexCode, jobDescription, errorLog, pageCount } = await request.json();

    if (!latexCode) {
      return NextResponse.json({ error: 'LaTeX code is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    let prompt = '';

    switch (action) {
      case 'fix_syntax':
        prompt = `
          You are a LaTeX expert. The following LaTeX code failed to compile.
          Error Log: ${errorLog || 'Unknown error'}
          
          Task: Fix the syntax errors in the LaTeX code.
          
          COMMON ERROR FIXES:
          1. "Misplaced alignment tab character &": This means an "&" was used without escaping. You MUST replace all unescaped "&" with "\\&" (unless inside a tabular environment, but this resume should not have tables).
          2. "File not found": Remove the package or command causing the issue.
          3. "Undefined control sequence": Remove or fix the command.
          4. "Missing $ inserted": Fix math mode issues.
          
          Rules:
          - Return ONLY the fixed LaTeX code.
          - Do not add markdown blocks.
          - Do not change the content, only fix the syntax.
          - SCAN THE CODE CAREFULLY for unescaped "&", "%", "$", "#", "_".
          
          LaTeX Code:
          ${latexCode}
        `;
        break;

      case 'fix_formatting':
        prompt = `
          You are a LaTeX Formatting Expert.
          Task: Fix formatting issues like overfull hboxes, bad alignment, and inconsistent spacing.
          
          Strategies:
          - Fix "Overfull \\hbox" by rewriting lines or adjusting spacing.
          - Ensure consistent spacing between sections.
          - Fix alignment of dates and titles (use \\hfill).
          - Ensure bullet points are properly aligned.
          
          Rules:
          - Return ONLY the fixed LaTeX code.
          - Do not add markdown blocks.
          - Maintain the overall structure.
          
          LaTeX Code:
          ${latexCode}
        `;
        break;

      case 'fix_overflow':
      case 'shorten':
        prompt = `
          You are a Resume Expert. The user's resume is too long (${pageCount || '>1'} pages).
          Task: Shorten the resume to fit exactly one page.
          
          Strategies:
          - Reduce vertical spacing (\\vspace, \\itemsep).
          - Condense bullet points (merge similar ones).
          - Remove less relevant details.
          - Shorten the summary.
          - Do NOT remove the "Experience" or "Education" sections completely.
          - Use \\small or \\footnotesize for less critical text if absolutely necessary, but prefer rewriting.
          
          Rules:
          - Return ONLY the shortened LaTeX code.
          - Maintain the original structure and template.
          - Do not add markdown blocks.
          
          LaTeX Code:
          ${latexCode}
        `;
        break;

      case 'fix_all':
        prompt = `
          🔥 MASTER PROMPT — Fix LaTeX Errors + Formatting + Overflow

          You are an expert LaTeX compiler and resume formatter.
          Your job is to repair the user’s LaTeX document based on compiler errors, page count, and warnings.

          You must:
          1. Fix all syntax errors (escape invalid characters & % # _ $).
          2. Fix alignment issues (use \\hfill for dates).
          3. Fix "misplaced alignment tab &" errors.
          4. Close all environments properly.
          5. Fix itemize/enumeration issues.
          6. Remove unnecessary whitespace.
          7. If the resume is longer than 1 page, condense it to fit 1 page.

          Error Log:
          ${errorLog || 'No errors detected'}

          Page Count: ${pageCount || 1}

          Rules:
          - Return ONLY the fixed LaTeX code.
          - Do not add markdown blocks.
          - Do not change the content unless necessary for fixing errors or shortening.
          
          LaTeX Code:
          ${latexCode}
        `;
        break;

      case 'optimize_resume':
        prompt = `
          You are acting as a Senior Technical Resume Editor + ATS Optimization Expert + LaTeX Formatting Specialist.
          Your task is to take my current LaTeX resume and transform it into a perfect, polished, recruiter-ready, single-page SWE resume.

          Here is what you must do:

          🎯 1. Improve Content Quality
          Strengthen every bullet with measurable results, impact, metrics, and action verbs.
          Rewrite bullets using Google/Amazon resume guidelines (impact → action → result).
          Remove redundant or filler phrases.
          Make wording crisp, concise, and technical.
          Prioritize SWE/Cloud/Backend relevance.

          🎯 2. Improve Structure & Order
          Use the following section order (standard SWE layout):
          Header
          Summary
          Experience
          Projects
          Skills
          Education
          Certifications (optional)
          Reorder or merge sections if needed for clarity.

          🎯 3. Optimize for ATS
          Add missing keywords that match a typical SWE internship job description.
          Ensure proper keyword distribution across experience and projects.
          Remove overly long sentences that reduce ATS score.
          Make skills section consistent and categorized.

          🎯 4. Ensure LaTeX Perfection
          Fix spacing, indentation, and section formatting.
          Use consistent itemize spacing: nosep, topsep=2pt, leftmargin=*.
          Use \\hfill for right-aligned dates (never use &).
          Escape all special characters (\\%, \\_, \\&, \\#, \\$).
          Ensure the resume compiles without warnings in Tectonic.
          Fit everything cleanly on one page, compress where required.

          🎯 5. Apply Design Improvements
          Clean up the header formatting for readability.
          Improve bold/italic usage for job titles, organizations, dates.
          Improve project formatting for uniformity.
          Maintain a modern minimalist Deedy-style layout.

          🎯 6. Maintain Professional Tone
          Use formal, neutral tone with no personal pronouns.
          Keep summary strictly technical.
          Avoid soft skills unless backed by examples.

          📌 Output Requirements
          Return the full corrected LaTeX code only.
          No commentary, no explanations, no Markdown.
          Ensure the final LaTeX compiles cleanly with Tectonic.
          Ensure final output is exactly one page.

          📌 After you output the improved version, analyze and run a second pass to ensure:
          The page is not overflowing.
          There are no redundant bullets.
          Skills and projects use parallel structure.
          Bullet length averages 10–20 words.
          Every line adds value.

          7. Fix broken hyperlinks or remove unused packages.
          8. Compress content to fit exactly one page if pageCount > 1.
          9. Reduce spacing in sections using titlesec and itemize spacing.
          10. Shorten verbose bullet points by 10–30% while keeping meaning.
          11. Ensure final LaTeX compiles with no errors.

          IMPORTANT RULES:
          - Output ONLY valid LaTeX code.
          - Do NOT explain changes.
          - Do NOT wrap in code blocks.
          - Maintain the Deedy/Friggeri style.
          - Never introduce tables or complex environments.
          - Prefer \\hfill for date alignment instead of &.

          Input LaTeX:
          ${latexCode}

          Compiler errors:
          ${errorLog || 'None'}

          Page count: ${pageCount || 'Unknown'}
        `;
        break;

      case 'improve_summary':
        prompt = `
          You are a Professional Resume Writer.
          Task: Rewrite the "Summary" or "Objective" section of this LaTeX resume to better match the Job Description.
          
          Job Description:
          ${jobDescription || 'General Software Engineering Role'}
          
          Rules:
          - Only modify the Summary section.
          - Keep the rest of the LaTeX code exactly the same.
          - Return the FULL LaTeX code with the improved summary.
          - Do not add markdown blocks.
          
          LaTeX Code:
          ${latexCode}
        `;
        break;

      case 'optimize_keywords':
        prompt = `
          You are an ATS Optimization Specialist.
          Task: Naturally insert relevant keywords from the Job Description into the resume's Skills and Experience sections.
          
          Job Description:
          ${jobDescription || 'General Software Engineering Role'}
          
          Rules:
          - Add keywords where they make sense (e.g., in the Skills list or as part of bullet points).
          - Do not disrupt the formatting.
          - Return the FULL LaTeX code with optimizations.
          - Do not add markdown blocks.
          
          LaTeX Code:
          ${latexCode}
        `;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let newLatexCode = response.text();

    // Cleanup
    newLatexCode = newLatexCode.replace(/^```latex\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    // Post-processing safety for &
    newLatexCode = newLatexCode.replace(/(?<!\\)&/g, '\\&');

    return NextResponse.json({ latexCode: newLatexCode });
  } catch (error: any) {
    console.error('AI Action Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
