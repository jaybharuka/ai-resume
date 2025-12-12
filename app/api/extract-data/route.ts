import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { text, base64, mimeType, html } = await request.json();

    if (!text && !base64 && !html) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const schema = `
    {
      "personalInfo": { 
        "name": "string", 
        "email": "string", 
        "phone": "string", 
        "linkedin": "string", 
        "github": "string", 
        "website": "string", 
        "location": "string" 
      },
      "summary": "string",
      "experience": [{ 
        "company": "string", 
        "role": "string", 
        "startDate": "string", 
        "endDate": "string", 
        "location": "string",
        "bullets": ["string"] 
      }],
      "education": [{ 
        "school": "string", 
        "degree": "string", 
        "year": "string",
        "gpa": "string"
      }],
      "skills": ["string"],
      "projects": [{
        "name": "string",
        "description": "string",
        "technologies": ["string"],
        "link": "string"
      }],
      "certifications": [{
        "name": "string",
        "issuer": "string",
        "date": "string"
      }],
      "languages": ["string"],
      "interests": ["string"],
      "awards": [{
        "title": "string",
        "date": "string",
        "issuer": "string"
      }],
      "customSections": [{
        "title": "string",
        "items": [{
          "name": "string",
          "description": "string",
          "date": "string",
          "bullets": ["string"]
        }]
      }]
    }
    `;

    const prompt = `You are an expert resume parser. Extract the resume data into this strict JSON structure: ${schema}. 
    
    CRITICAL RULES:
    1. Extract ALL content verbatim. Do not summarize, do not shorten, do not skip any bullet points.
    2. If a section exists in the resume (like "Volunteering", "Publications", "Leadership") and does NOT fit into standard fields (Experience, Education, Skills, Projects, Awards), put it in "customSections".
    3. For "Experience" and "Projects", include EVERY bullet point from the original text.
    4. If a field is missing, leave it empty.
    5. Return ONLY the JSON object.`;

    let result;
    if (base64) {
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: mimeType || 'application/pdf',
          },
        },
      ]);
    } else {
      const content = text || html;
      result = await model.generateContent([prompt, `RESUME CONTENT:\n${content}`]);
    }

    const response = await result.response;
    let jsonStr = response.text();
    
    // Cleanup markdown code blocks if present
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error extracting data:', error);
    return NextResponse.json(
      { error: 'Failed to extract data' },
      { status: 500 }
    );
  }
}
