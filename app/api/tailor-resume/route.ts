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

    const schema = JSON.stringify(resumeData, null, 2); // Use the input data as the schema template

    const prompt = `
    You are an expert resume writer and career coach.
    I will provide you with a resume in JSON format and a Job Description.
    
    Your task is to TAILOR the resume content to better match the Job Description, increasing the candidate's chances of getting an interview.

    JOB DESCRIPTION:
    ${jobDescription}

    RESUME DATA (JSON):
    ${JSON.stringify(resumeData)}

    INSTRUCTIONS:
    1. Analyze the Job Description to identify key skills, keywords, and requirements.
    2. Rewrite the "summary" to be targeted towards this specific role.
    3. Rewrite the "bullets" in the "experience" section to emphasize matching skills and experiences. Use strong action verbs and quantify results.
    4. Update the "skills" array to include relevant keywords from the JD (that the candidate likely has based on their experience).
    5. Do NOT invent experiences. Only reframe existing ones.
    6. Return the result as a valid JSON object matching the exact structure of the input RESUME DATA.
    7. Ensure "sectionOrder" is preserved or intelligently updated.
    8. Do NOT include markdown formatting (like \`\`\`json). Return ONLY the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let tailoredJsonString = response.text();

    // Cleanup if the model returns markdown code blocks
    tailoredJsonString = tailoredJsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    let tailoredData;
    try {
        tailoredData = JSON.parse(tailoredJsonString);
    } catch (e) {
        console.error("Failed to parse tailored JSON", e);
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tailoredData });

  } catch (error) {
    console.error('Error tailoring resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
