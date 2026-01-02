import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const { resumeData } = await request.json();

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
You are an expert resume writer and career coach. Analyze the following resume data and generate a compelling professional summary.

RESUME DATA:
- Name: ${resumeData.personalInfo?.name || 'Not provided'}
- Experience: ${JSON.stringify(resumeData.experience || [])}
- Education: ${JSON.stringify(resumeData.education || [])}
- Skills: ${JSON.stringify(resumeData.skills || [])}
- Projects: ${JSON.stringify(resumeData.projects || [])}
- Certifications: ${JSON.stringify(resumeData.certifications || [])}

INSTRUCTIONS:
1. Write a 2-3 sentence professional summary that highlights the candidate's key strengths
2. Focus on their most relevant experience, skills, and achievements
3. Use strong, active language
4. Make it compelling for recruiters
5. Keep it concise (50-80 words max)
6. Do NOT include any formatting or markdown
7. Return ONLY the summary text, nothing else

Generate the summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    return NextResponse.json({ success: true, summary });

  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
