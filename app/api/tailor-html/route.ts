import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { html, jobDescription } = await request.json();

    if (!html || !jobDescription) {
      return NextResponse.json(
        { error: 'HTML content and Job Description are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
    You are an expert resume writer and career coach.
    I will provide you with a resume in HTML format and a Job Description.
    
    Your task is to TAILOR the resume content to better match the Job Description, increasing the candidate's chances of getting an interview.

    JOB DESCRIPTION:
    ${jobDescription}

    RESUME HTML:
    ${html}

    INSTRUCTIONS:
    1. Analyze the Job Description to identify key skills, keywords, and requirements.
    2. Rewrite the resume content to emphasize these matching skills and experiences.
    3. CRITICAL: PRESERVE THE HTML STRUCTURE EXACTLY. Do not change the layout, classes, or styles. Only modify the text content within the tags.
    4. You may reorder bullet points or add/remove specific bullet points if they are more/less relevant, but keep the <ul>/<li> structure.
    5. Update the Professional Summary (if present) to be targeted towards this specific role.
    6. Use strong action verbs and quantify results where possible.
    7. Do not hallucinate or invent experiences the candidate doesn't have.
    8. HIGHLIGHT CHANGES: Wrap any text you change, add, or rewrite in <span style="background-color: #dcfce7; color: #166534; font-weight: bold;">...</span> tags. This is crucial for the user to see what you improved.
    9. Return ONLY the raw HTML string. Do not include markdown code blocks (like \`\`\`html).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let tailoredHtml = response.text();

    // Cleanup if the model returns markdown code blocks
    tailoredHtml = tailoredHtml.replace(/^```html\s*/, '').replace(/\s*```$/, '');

    return NextResponse.json({ success: true, tailoredHtml });

  } catch (error) {
    console.error('Error tailoring HTML resume:', error);
    return NextResponse.json(
      { error: 'Failed to tailor resume' },
      { status: 500 }
    );
  }
}
