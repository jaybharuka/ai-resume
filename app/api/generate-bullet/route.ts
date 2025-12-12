import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `The user is missing the skill "${keyword}" from their resume. Write a single, professional bullet point for a Software Engineer using this skill. Do not use generic filler words. Return ONLY the bullet point text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const bulletPoint = response.text().trim();

    return NextResponse.json({ success: true, bulletPoint });
  } catch (error) {
    console.error('Error generating bullet point:', error);
    return NextResponse.json(
      { error: 'Failed to generate bullet point' },
      { status: 500 }
    );
  }
}
