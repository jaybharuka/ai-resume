import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PreviewSectionRequest {
  sectionLatex: string;
  jobDescription: string;
  action: 'rewrite_for_jd' | 'improve_clarity' | 'optimize_ats' | 'shorten';
  sectionTitle: string;
  strictness?: 'conservative' | 'balanced' | 'aggressive';
}

const ACTION_PROMPTS: Record<string, string> = {
  rewrite_for_jd: `Rewrite this resume section to better align with the job description. 
Highlight relevant skills and experiences that match the job requirements.
Use strong action verbs and quantify achievements where possible.`,

  improve_clarity: `Improve the clarity and readability of this resume section.
Use concise language, strong action verbs, and clear formatting.
Remove redundant words and improve sentence structure.`,

  optimize_ats: `Optimize this resume section for Applicant Tracking Systems (ATS).
Include relevant keywords from the job description naturally.
Use standard section headings and avoid complex formatting.
Ensure key skills and qualifications are prominently featured.`,

  shorten: `Condense this resume section while preserving the most impactful information.
Remove redundant content and combine related points.
Keep the most relevant and impressive achievements.
Aim for a more concise presentation without losing key details.`,
};

// Strictness-aware rules for AI behavior
const STRICTNESS_RULES: Record<string, { rules: string; explanationStyle: string }> = {
  conservative: {
    rules: `STRICTNESS: CONSERVATIVE (Minimal Changes)
- Make only minor wording improvements for clarity
- Do NOT add any new information, skills, or keywords
- Do NOT add metrics or numbers unless they already exist in the original
- Do NOT reorder or restructure bullet points
- Do NOT add industry jargon or buzzwords
- Preserve the original tone and voice exactly
- Only fix grammar, punctuation, and awkward phrasing
- Keep all original facts, dates, and details unchanged`,
    explanationStyle: `For explanations, focus on: grammar fixes, clarity improvements, minor word choice changes. Use phrases like "Clarified wording", "Fixed grammar", "Improved readability", "Simplified phrasing".`
  },
  balanced: {
    rules: `STRICTNESS: BALANCED (Moderate Enhancement)
- Improve phrasing and strengthen action verbs
- May add relevant keywords FROM THE JOB DESCRIPTION if they fit naturally
- Do NOT invent new achievements, metrics, or experiences
- Do NOT add numbers or percentages unless they exist in the original
- May reorder bullets to emphasize most relevant points first
- Keep the same number of bullet points
- Maintain factual accuracy - only rephrase existing content
- Do NOT fabricate skills or technologies not mentioned`,
    explanationStyle: `For explanations, focus on: action verb improvements, keyword alignment, emphasis changes. Use phrases like "Strengthened action verbs", "Aligned with job requirements", "Emphasized relevant skills", "Reordered for impact".`
  },
  aggressive: {
    rules: `STRICTNESS: AGGRESSIVE (Maximum Optimization)
- Significantly rewrite for maximum impact and ATS optimization
- Add relevant keywords and phrases FROM THE JOB DESCRIPTION liberally
- May restructure and reorder content for better flow
- Use powerful action verbs and professional language
- CRITICAL: Do NOT invent new achievements, metrics, companies, or experiences
- CRITICAL: Do NOT add specific numbers, percentages, or dollar amounts unless they exist in the original
- CRITICAL: Do NOT fabricate technologies, certifications, or skills not mentioned
- May expand on existing points to highlight relevance to job description
- Transform passive language to active, impactful statements`,
    explanationStyle: `For explanations, focus on: ATS optimization, keyword integration, impact enhancement. Use phrases like "Added ATS-relevant keywords", "Optimized for job match", "Enhanced impact language", "Restructured for visibility".`
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: PreviewSectionRequest = await request.json();
    const { sectionLatex, jobDescription, action, sectionTitle, strictness = 'conservative' } = body;
    
    // Get strictness-specific rules
    const strictnessConfig = STRICTNESS_RULES[strictness] || STRICTNESS_RULES.conservative;

    if (!sectionLatex) {
      return NextResponse.json(
        { error: 'Section LaTeX is required' },
        { status: 400 }
      );
    }

    if (!jobDescription && action === 'rewrite_for_jd') {
      return NextResponse.json(
        { error: 'Job description is required for this action' },
        { status: 400 }
      );
    }

    const actionPrompt = ACTION_PROMPTS[action] || ACTION_PROMPTS.improve_clarity;

    // Strictness-aware prompt with injected rules
    const systemPrompt = `You are an expert resume writer.
Your task is to improve a specific section of a resume and explain your changes.

${strictnessConfig.rules}

ANTI-HALLUCINATION RULES (NEVER VIOLATE):
- NEVER invent facts, degrees, companies, job titles, or experiences
- NEVER add metrics, percentages, or numbers that don't exist in the original
- NEVER fabricate technologies, tools, or skills not mentioned in the original
- NEVER claim achievements or results that aren't in the original content
- If the original has no metrics, the output must have no metrics
- Only work with information that EXISTS in the original content

You must return a JSON object with two fields:
1. "improvedContent" - The improved section as plain text
2. "explanations" - An array of 3-4 short bullet points explaining what you changed and why

CONTENT FORMAT RULES:
- Output ONLY plain text in improvedContent - NO LaTeX commands
- Do NOT include \\section, \\textbf, \\item, or any LaTeX formatting
- Use bullet points as "• " for list items
- Keep the section title on the first line
- Keep dates, company names, and job titles unchanged

EXPLANATION RULES:
- Write exactly 3-4 short bullet points
- ${strictnessConfig.explanationStyle}
- Do NOT mention "strictness level" or "AI" in explanations
- Do NOT use marketing language
- Start each bullet with an action verb
- Keep each bullet under 15 words

${jobDescription ? `JOB DESCRIPTION FOR CONTEXT:
${jobDescription}

` : ''}ACTION TO PERFORM:
${actionPrompt}

ORIGINAL SECTION (${sectionTitle}):
${sectionLatex}

Return ONLY a valid JSON object in this exact format:
{
  "improvedContent": "Section title\\n\\nImproved content here...",
  "explanations": [
    "First change explanation",
    "Second change explanation",
    "Third change explanation"
  ]
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let responseText = response.text();

    // Clean up response - remove markdown code blocks
    responseText = responseText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse JSON response
    let improvedText = '';
    let explanations: string[] = [];

    try {
      const parsed = JSON.parse(responseText);
      improvedText = parsed.improvedContent || '';
      explanations = Array.isArray(parsed.explanations) ? parsed.explanations : [];
    } catch {
      // Fallback if JSON parsing fails - treat entire response as content
      improvedText = responseText;
      explanations = ['Content was improved based on the selected action'];
    }

    // Clean up improved text - remove any accidental LaTeX
    improvedText = improvedText
      .replace(/\\section\*?\{[^}]+\}/g, '')
      .replace(/\\textbf\{([^}]*)\}/g, '$1')
      .replace(/\\textit\{([^}]*)\}/g, '$1')
      .replace(/\\item\s*/g, '• ')
      .trim();

    // Ensure section title is at the top if missing
    if (!improvedText.toLowerCase().startsWith(sectionTitle.toLowerCase())) {
      improvedText = `${sectionTitle}\n\n${improvedText}`;
    }

    // Clean up explanations - ensure they're strings and not too long
    explanations = explanations
      .filter(e => typeof e === 'string' && e.trim().length > 0)
      .slice(0, 4)
      .map(e => e.trim());

    return NextResponse.json({
      success: true,
      originalLatex: sectionLatex,
      improvedText: improvedText,
      explanations: explanations,
    });
  } catch (error: any) {
    console.error('Preview section error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
