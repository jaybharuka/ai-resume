import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { base64, mimeType } = await request.json();

    if (!base64) {
      return NextResponse.json(
        { error: 'File content is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Turn this resume PDF into semantic HTML. Preserve the structure, bullet points, and headers exactly as they appear. Return ONLY the HTML code. Do not include markdown formatting like \`\`\`html ... \`\`\`.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: mimeType || 'application/pdf',
        },
      },
    ]);

    const response = await result.response;
    let html = response.text();
    
    // Cleanup markdown code blocks if present
    html = html.replace(/```html/g, '').replace(/```/g, '');

    return NextResponse.json({ success: true, html });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}
