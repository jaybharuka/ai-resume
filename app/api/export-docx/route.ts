import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { ResumeData } from '@/types/resume';

export async function POST(request: NextRequest) {
  try {
    const { resumeData, templateName = 'modern' }: { resumeData: ResumeData; templateName?: string } = await request.json();

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Create DOCX document from structured data
    const doc = new Document({
      sections: [{
        properties: {},
        children: createDocxContent(resumeData),
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename=resume.docx',
      },
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json(
      { error: 'Failed to generate DOCX' },
      { status: 500 }
    );
  }
}

function createDocxContent(data: ResumeData): (Paragraph | any)[] {
  const content: (Paragraph | any)[] = [];

  // Header with name and contact
  if (data.personalInfo?.name) {
    content.push(
      new Paragraph({
        text: data.personalInfo.name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  if (data.personalInfo?.email || data.personalInfo?.phone || data.personalInfo?.location) {
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location
    ].filter(Boolean).join(' | ');

    content.push(
      new Paragraph({
        text: contactInfo,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Professional Summary
  if (data.summary) {
    content.push(
      new Paragraph({
        text: 'Professional Summary',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    content.push(
      new Paragraph({
        text: data.summary,
        spacing: { after: 300 },
      })
    );
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    content.push(
      new Paragraph({
        text: 'Experience',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.experience.forEach((exp, index) => {
      // Job title and company
      const titleLine = `${exp.role || ''}${exp.company ? ` at ${exp.company}` : ''}`;
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: titleLine,
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      // Dates and location
      const dateLine = [
        exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : exp.startDate,
        exp.location
      ].filter(Boolean).join(' | ');

      if (dateLine) {
        content.push(
          new Paragraph({
            text: dateLine,
            spacing: { after: 200 },
          })
        );
      }

      // Description/Bullets
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet: string) => {
          content.push(
            new Paragraph({
              text: bullet.replace(/^[-•*]\s*/, ''),
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );
        });
      }

      // Add spacing between jobs
      if (index < data.experience.length - 1) {
        content.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      }
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    content.push(
      new Paragraph({
        text: 'Education',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.education.forEach((edu, index) => {
      const eduLine = `${edu.degree || ''}${edu.school ? ` from ${edu.school}` : ''}`;
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: eduLine,
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      const dateLine = [
        edu.year,
        edu.gpa && `GPA: ${edu.gpa}`
      ].filter(Boolean).join(' | ');

      if (dateLine) {
        content.push(
          new Paragraph({
            text: dateLine,
            spacing: { after: 200 },
          })
        );
      }

      if (index < data.education.length - 1) {
        content.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      }
    });
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    content.push(
      new Paragraph({
        text: 'Skills',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    content.push(
      new Paragraph({
        text: data.skills.join(', '),
        spacing: { after: 300 },
      })
    );
  }

  return content;
}
