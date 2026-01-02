import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: API key missing' },
        { status: 500 }
      );
    }

    const { text, base64, mimeType, html } = await request.json();
    console.log('API extract-data called', { textLength: text ? text.length : 0, base64Length: base64 ? base64.length : 0, mimeType: mimeType || null, hasHtml: Boolean(html) });

    if (!text && !base64 && !html) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Canonical schema matching types/resume.ts
    const schema = `{
  "personalInfo": { 
    "name": "string", 
    "email": "string", 
    "phone": "string", 
    "linkedin": "string (full URL)", 
    "github": "string (full URL)", 
    "website": "string (full URL)", 
    "location": "string" 
  },
  "summary": "string (professional summary or objective)",
  "experience": [{ 
    "company": "string", 
    "title": "string (job title/role)", 
    "startDate": "string (e.g., Jan 2020)", 
    "endDate": "string (e.g., Present, Dec 2023)", 
    "location": "string",
    "bullets": ["string (each bullet point VERBATIM)"] 
  }],
  "education": [{ 
    "institution": "string (school name)", 
    "degree": "string (full degree name)", 
    "graduationDate": "string",
    "gpa": "string",
    "honors": "string",
    "coursework": ["string"]
  }],
  "skills": ["string (individual skill, NOT grouped)"],
  "projects": [{
    "name": "string",
    "description": "string",
    "technologies": ["string"],
    "url": "string",
    "date": "string"
  }],
  "certifications": [{
    "name": "string",
    "issuer": "string",
    "date": "string"
  }],
  "awards": ["string (each award as a single string)"],
  "customSections": [{
    "title": "string (section header)",
    "content": "string (if paragraph format)",
    "items": ["string (if list format)"]
  }],
  "sectionOrder": ["string (order of sections as they appear)"]
}`;

    const prompt = `You are an EXPERT resume parser with PERFECT accuracy. Your job is to extract resume data into a structured JSON format.

=== OUTPUT SCHEMA ===
${schema}

=== CRITICAL EXTRACTION RULES ===

1. **VERBATIM EXTRACTION**: Copy text EXACTLY as written. Do NOT:
   - Summarize or shorten bullet points
   - Add words or metrics that don't exist
   - Change verb tenses or phrasing
   - Skip ANY bullet point or detail

2. **FIELD MAPPING**:
   - "title" in experience = job title/role (not "role")
   - "institution" in education = school name (not "school")
   - "graduationDate" = graduation year/date (not "year")
   - "url" in projects = project link (not "link")

3. **SKILLS HANDLING**:
   - Split grouped skills into individual items
   - "Python, Java, SQL" → ["Python", "Java", "SQL"]
   - Include ALL skills mentioned anywhere in the resume

4. **BULLET POINTS**:
   - Include EVERY bullet point for each role/project
   - Do NOT limit to 3-4 bullets - extract ALL of them
   - Preserve exact wording including metrics and percentages

5. **SECTION ORDER**:
   - sectionOrder MUST list sections in the ORDER they appear in the resume
   - Use these exact keys: "summary", "experience", "education", "skills", "projects", "certifications", "awards", "customSections"
   - Example: ["summary", "education", "skills", "experience", "projects"]

6. **CUSTOM SECTIONS**:
   - Any section that doesn't fit standard fields goes in customSections
   - Examples: "Volunteering", "Publications", "Leadership", "Extracurriculars"
   - Preserve the original section title

7. **EMPTY FIELDS**:
   - If a field has no data, use empty string "" or empty array []
   - Do NOT omit fields from the output

8. **LINKS**:
   - Extract full URLs for linkedin, github, website, project urls
   - If only username shown, construct full URL

=== OUTPUT FORMAT ===
Return ONLY the JSON object. No markdown, no explanation, no code blocks.`;

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
      result = await model.generateContent([prompt, `\n\n=== RESUME CONTENT TO PARSE ===\n${content}`]);
    }

    const response = await result.response;
    let jsonStr = response.text();
    
    // Cleanup markdown code blocks if present
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse and normalize the data
    const rawData = JSON.parse(jsonStr);
    
    // Normalize field names for consistency with our schema
    const normalizedData = normalizeExtractedData(rawData);

    return NextResponse.json({ 
      success: true, 
      data: normalizedData
    });
  } catch (error: any) {
    console.error('Error extracting data:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    return NextResponse.json(
      { error: error.message || 'Failed to extract data' },
      { status: 500 }
    );
  }
}

/**
 * Normalize extracted data to match our canonical schema
 * Handles cases where Gemini uses slightly different field names
 */
function normalizeExtractedData(data: any): any {
  const normalized = { ...data };
  
  // Normalize experience entries
  if (normalized.experience) {
    normalized.experience = normalized.experience.map((exp: any) => ({
      company: exp.company || '',
      title: exp.title || exp.role || '',  // Handle both "title" and "role"
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      location: exp.location || '',
      // Clean bullets: filter empty, trim whitespace, normalize line breaks
      bullets: (exp.bullets || [])
        .map((b: string) => b?.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim())
        .filter((b: string) => b && b.length > 0)
    }));
  }
  
  // Normalize education entries
  if (normalized.education) {
    normalized.education = normalized.education.map((edu: any) => ({
      institution: edu.institution || edu.school || '',  // Handle both names
      degree: edu.degree || '',
      graduationDate: edu.graduationDate || edu.year || '',  // Handle both names
      gpa: edu.gpa || '',
      honors: edu.honors || '',
      coursework: edu.coursework || []
    }));
  }
  
  // Normalize projects
  if (normalized.projects) {
    normalized.projects = normalized.projects.map((proj: any) => ({
      name: proj.name || '',
      description: proj.description || '',
      technologies: proj.technologies || [],
      url: proj.url || proj.link || '',  // Handle both names
      date: proj.date || ''
    }));
  }
  
  // Normalize awards (convert objects to strings if needed)
  if (normalized.awards && Array.isArray(normalized.awards)) {
    normalized.awards = normalized.awards.map((award: any) => {
      if (typeof award === 'string') return award;
      // If it's an object, convert to string
      if (award.title) {
        let str = award.title;
        if (award.issuer) str += ` - ${award.issuer}`;
        if (award.date) str += ` (${award.date})`;
        return str;
      }
      return JSON.stringify(award);
    });
  }
  
  // Ensure sectionOrder exists
  if (!normalized.sectionOrder || !Array.isArray(normalized.sectionOrder)) {
    normalized.sectionOrder = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'awards'];
  }
  
  return normalized;
}
