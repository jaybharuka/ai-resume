import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { html, jobDescription } = await request.json();
    console.log('API analyze-ats called', { htmlLength: html ? html.length : 0, jobProvided: !!jobDescription });

    if (!html) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
    You are a highly accurate ATS (Applicant Tracking System) scanner.
    Your task is to evaluate the provided resume against the Job Description (JD) using a strict weighted scoring formula.
    
    RESUME HTML:
    ${html}

    JOB DESCRIPTION:
    ${jobDescription || "NO JOB DESCRIPTION PROVIDED. PERFORM GENERAL AUDIT."}

    SCORING CRITERIA (Total 100 points):
    1. Keyword Match (0-40 points):
       - If JD is provided: How many hard skills, tools, and requirements from the JD are present?
       - If NO JD: Score based on presence of standard industry keywords for the apparent role (max 30).
    2. Impact Score (0-30 points):
       - Are achievements quantified with numbers (%, $, X to Y)?
       - Do bullet points show results, not just duties?
    3. Formatting Check (0-15 points):
       - Are contact info, standard headers (Experience, Education), and chronological dates present?
       - Is the layout logical?
    4. Brevity Score (0-15 points):
       - Is the length appropriate (approx 400-1000 words)?
       - Is it concise?

    OUTPUT FORMAT:
    Return ONLY a JSON object with this exact structure:
    {
      "total_score": number,
      "breakdown": {
        "keyword_match": number,
        "impact_score": number,
        "formatting_check": number,
        "brevity_score": number
      },
      "missing_keywords": ["string", "string"],
      "feedback": "string (A short paragraph explaining the score and listing 3 critical missing keywords if any)"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Cleanup markdown if present
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    const analysis = JSON.parse(text);

    return NextResponse.json({ success: true, analysis });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
