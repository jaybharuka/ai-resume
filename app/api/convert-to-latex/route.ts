import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ConvertToLatexRequest {
  plainText: string;
  originalLatex: string;
  sectionTitle: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConvertToLatexRequest = await request.json();
    const { plainText, originalLatex, sectionTitle } = body;

    if (!plainText) {
      return NextResponse.json(
        { error: 'Plain text content is required' },
        { status: 400 }
      );
    }

    if (!originalLatex) {
      return NextResponse.json(
        { error: 'Original LaTeX is required for structure reference' },
        { status: 400 }
      );
    }

    // Determine if section uses starred variant
    const useStarredSection = originalLatex.includes('\\section*{');

    const systemPrompt = `You are an expert LaTeX formatter for resumes.
Your task is to convert plain text resume content into valid LaTeX format.

CRITICAL RULES:
1. Output ONLY valid LaTeX code - no explanations or comments
2. Use ${useStarredSection ? '\\section*{' : '\\section{'}${sectionTitle}} as the section header
3. Match the formatting style of the original LaTeX structure
4. Convert bullet points (• or -) to \\item within itemize environment
5. Use \\textbf{} for bold text (job titles, company names, degrees)
6. Use \\hfill for right-aligned dates
7. Do NOT invent any new information
8. Preserve all dates, names, and facts exactly as given
9. Output should compile cleanly in LaTeX

ORIGINAL LATEX STRUCTURE (use as formatting reference):
${originalLatex}

PLAIN TEXT CONTENT TO CONVERT:
${plainText}

Output ONLY the LaTeX code. Start with ${useStarredSection ? '\\section*{' : '\\section{'}${sectionTitle}}:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let latexOutput = response.text();

    // Clean up the response - remove markdown code blocks if present
    latexOutput = latexOutput
      .replace(/```latex\n?/gi, '')
      .replace(/```tex\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();

    // Ensure the response starts with \section
    if (!latexOutput.startsWith('\\section')) {
      // Try to find and extract the section
      const sectionMatch = latexOutput.match(/\\section\*?\{[^}]+\}[\s\S]*/);
      if (sectionMatch) {
        latexOutput = sectionMatch[0];
      } else {
        // Wrap content with section header if missing
        latexOutput = `${useStarredSection ? '\\section*{' : '\\section{'}${sectionTitle}}\n${latexOutput}`;
      }
    }

    // Validate section title matches
    const titleMatch = latexOutput.match(/\\section\*?\{([^}]+)\}/);
    if (titleMatch) {
      const extractedTitle = titleMatch[1].trim().toLowerCase();
      const expectedTitle = sectionTitle.trim().toLowerCase();
      if (extractedTitle !== expectedTitle) {
        // Fix the section title
        latexOutput = latexOutput.replace(
          /\\section\*?\{[^}]+\}/,
          `${useStarredSection ? '\\section*{' : '\\section{'}${sectionTitle}}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      latex: latexOutput,
    });
  } catch (error: any) {
    console.error('Convert to LaTeX error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert to LaTeX' },
      { status: 500 }
    );
  }
}
