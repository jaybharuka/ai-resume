/**
 * Flexible LaTeX Generator
 * 
 * AI-DRIVEN LaTeX generation with soft guardrails.
 * NOT a locked template - builds LaTeX from ResumeData iteratively.
 */

import { ResumeData, Experience, Education, Project, Certification, CustomSection, Award } from '@/types/resume';
import { applyGuardrails, normalizeSectionOrder } from '@/lib/resume/guardrails';

// ============ LATEX PRIMITIVES ============
// Consistent building blocks for clean LaTeX

const escapeTex = (text: string): string => {
  if (!text) return '';
  return text
    // First, normalize whitespace - replace newlines and multiple spaces with single space
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // Then escape LaTeX special characters
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}')
    .replace(/\|/g, '\\textbar{}');
};

const makeHyperlink = (url: string, text?: string): string => {
  const display = text || url;
  const cleanUrl = url.replace(/[#%]/g, '');
  return `\\href{${cleanUrl}}{${escapeTex(display)}}`;
};

// ============ HELPER FUNCTIONS ============

// Get job title from Experience (handles both title and role fields)
const getJobTitle = (exp: Experience): string => exp.title || exp.role || 'Role';

// Get institution from Education (handles both institution and school fields)
const getInstitution = (edu: Education): string => edu.institution || edu.school || 'Institution';

// Get graduation date from Education (handles both graduationDate and year fields)
const getGradDate = (edu: Education): string => edu.graduationDate || edu.year || '';

// Get project URL (handles both url and link fields)
const getProjectUrl = (proj: Project): string | undefined => proj.url || proj.link;

// Convert Award to string if needed
const awardToString = (award: string | Award): string => {
  if (typeof award === 'string') return award;
  let str = award.title;
  if (award.issuer) str += ` - ${award.issuer}`;
  if (award.date) str += ` (${award.date})`;
  return str;
};

// ============ SECTION GENERATORS ============

const generatePersonalInfo = (data: ResumeData): string => {
  const { personalInfo } = data;
  if (!personalInfo) return '';

  const lines: string[] = [];
  
  // Name as title
  lines.push(`\\begin{center}`);
  lines.push(`{\\Huge\\bfseries ${escapeTex(personalInfo.name || 'Your Name')}} \\\\[0.3em]`);
  
  // Contact line
  const contactParts: string[] = [];
  if (personalInfo.location) contactParts.push(escapeTex(personalInfo.location));
  if (personalInfo.phone) contactParts.push(escapeTex(personalInfo.phone));
  if (personalInfo.email) contactParts.push(makeHyperlink(`mailto:${personalInfo.email}`, personalInfo.email));
  if (personalInfo.linkedin) contactParts.push(makeHyperlink(personalInfo.linkedin, 'LinkedIn'));
  if (personalInfo.github) contactParts.push(makeHyperlink(personalInfo.github, 'GitHub'));
  if (personalInfo.website) contactParts.push(makeHyperlink(personalInfo.website, 'Portfolio'));
  
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' \\textbar{} '));
  }
  
  lines.push(`\\end{center}`);
  lines.push('');
  
  return lines.join('\n');
};

const generateSummary = (summary?: string): string => {
  if (!summary || summary.trim().length === 0) return '';
  
  return [
    `\\section*{Summary}`,
    escapeTex(summary),
    ''
  ].join('\n');
};

const generateSkills = (skills?: string[]): string => {
  if (!skills || skills.length === 0) return '';
  
  // Escape each skill individually, then join with LaTeX bullet (not escaped)
  const escapedSkills = skills.map(skill => escapeTex(skill));
  
  return [
    `\\section*{Technical Skills}`,
    escapedSkills.join(' \\textbullet{} '),
    ''
  ].join('\n');
};

const generateExperience = (experience?: Experience[]): string => {
  if (!experience || experience.length === 0) return '';
  
  const lines: string[] = [`\\section*{Experience}`];
  
  experience.forEach(exp => {
    // Title line with company and dates
    const titleLine = `\\textbf{${escapeTex(getJobTitle(exp))}}`;
    const companyLine = exp.company ? `, ${escapeTex(exp.company)}` : '';
    const locationLine = exp.location ? ` -- ${escapeTex(exp.location)}` : '';
    const dateLine = exp.startDate ? `\\hfill ${escapeTex(exp.startDate)}${exp.endDate ? ` -- ${escapeTex(exp.endDate)}` : ' -- Present'}` : '';
    
    lines.push(`\\noindent${titleLine}${companyLine}${locationLine}${dateLine} \\\\`);
    
    // Bullets
    if (exp.bullets && exp.bullets.length > 0) {
      // Filter out empty bullets and normalize text
      const validBullets = exp.bullets.filter(bullet => bullet && bullet.trim().length > 0);
      if (validBullets.length > 0) {
        lines.push(`\\begin{itemize}[leftmargin=*, nosep]`);
        validBullets.forEach(bullet => {
          lines.push(`  \\item ${escapeTex(bullet)}`);
        });
        lines.push(`\\end{itemize}`);
      }
    }
    lines.push('');
  });
  
  return lines.join('\n');
};

const generateEducation = (education?: Education[]): string => {
  if (!education || education.length === 0) return '';
  
  const lines: string[] = [`\\section*{Education}`];
  
  education.forEach(edu => {
    const degreeLine = `\\textbf{${escapeTex(edu.degree || 'Degree')}}`;
    const institutionLine = getInstitution(edu) ? ` -- ${escapeTex(getInstitution(edu))}` : '';
    const dateLine = getGradDate(edu) ? `\\hfill ${escapeTex(getGradDate(edu))}` : '';
    
    lines.push(`\\noindent${degreeLine}${institutionLine}${dateLine}`);
    
    if (edu.gpa) {
      lines.push(`\\\\GPA: ${escapeTex(edu.gpa)}`);
    }
    if (edu.honors) {
      lines.push(`\\\\${escapeTex(edu.honors)}`);
    }
    if (edu.coursework && edu.coursework.length > 0) {
      lines.push(`\\\\Relevant Coursework: ${escapeTex(edu.coursework.join(', '))}`);
    }
    lines.push('');
  });
  
  return lines.join('\n');
};

const generateProjects = (projects?: Project[]): string => {
  if (!projects || projects.length === 0) return '';
  
  const lines: string[] = [`\\section*{Projects}`];
  
  projects.forEach(proj => {
    const titleLine = `\\textbf{${escapeTex(proj.name || 'Project')}}`;
    const techLine = proj.technologies && proj.technologies.length > 0 
      ? ` (${escapeTex(proj.technologies.join(', '))})`
      : '';
    const dateLine = proj.date ? `\\hfill ${escapeTex(proj.date)}` : '';
    
    lines.push(`\\noindent${titleLine}${techLine}${dateLine}`);
    
    if (proj.description) {
      lines.push(`\\\\${escapeTex(proj.description)}`);
    }
    
    const url = getProjectUrl(proj);
    if (url) {
      lines.push(`\\\\${makeHyperlink(url)}`);
    }
    lines.push('');
  });
  
  return lines.join('\n');
};

const generateCertifications = (certifications?: Certification[]): string => {
  if (!certifications || certifications.length === 0) return '';
  
  const lines: string[] = [`\\section*{Certifications}`];
  
  lines.push(`\\begin{itemize}[leftmargin=*, nosep]`);
  certifications.forEach(cert => {
    const certLine = `\\textbf{${escapeTex(cert.name)}}`;
    const issuerLine = cert.issuer ? ` -- ${escapeTex(cert.issuer)}` : '';
    const dateLine = cert.date ? ` (${escapeTex(cert.date)})` : '';
    lines.push(`  \\item ${certLine}${issuerLine}${dateLine}`);
  });
  lines.push(`\\end{itemize}`);
  lines.push('');
  
  return lines.join('\n');
};

const generateAwards = (awards?: (string | Award)[]): string => {
  if (!awards || awards.length === 0) return '';
  
  const lines: string[] = [`\\section*{Awards \\& Achievements}`];
  
  lines.push(`\\begin{itemize}[leftmargin=*, nosep]`);
  awards.forEach(award => {
    lines.push(`  \\item ${escapeTex(awardToString(award))}`);
  });
  lines.push(`\\end{itemize}`);
  lines.push('');
  
  return lines.join('\n');
};

const generateCustomSections = (customSections?: CustomSection[]): string => {
  if (!customSections || customSections.length === 0) return '';
  
  return customSections.map(section => {
    const lines: string[] = [`\\section*{${escapeTex(section.title)}}`];
    
    if (section.content) {
      lines.push(escapeTex(section.content));
    }
    
    // Handle simple string items
    if (section.items && section.items.length > 0) {
      lines.push(`\\begin{itemize}[leftmargin=*, nosep]`);
      section.items.forEach(item => {
        if (item && item.trim()) {
          lines.push(`  \\item ${escapeTex(item)}`);
        }
      });
      lines.push(`\\end{itemize}`);
    }
    
    // Handle detailed items (legacy format)
    if (section.detailedItems && section.detailedItems.length > 0) {
      section.detailedItems.forEach(item => {
        if (item.name) {
          lines.push(`\\noindent\\textbf{${escapeTex(item.name)}}`);
          if (item.date) lines.push(`\\hfill ${escapeTex(item.date)}`);
          lines.push('\\\\');
        }
        if (item.description) {
          lines.push(escapeTex(item.description));
        }
        if (item.bullets && item.bullets.length > 0) {
          lines.push(`\\begin{itemize}[leftmargin=*, nosep]`);
          item.bullets.forEach(b => lines.push(`  \\item ${escapeTex(b)}`));
          lines.push(`\\end{itemize}`);
        }
      });
    }
    
    lines.push('');
    return lines.join('\n');
  }).join('\n');
};

// ============ DOCUMENT STRUCTURE ============

const DOCUMENT_PREAMBLE = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\usepackage{parskip}

\\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  urlcolor=blue
}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{0.8em}{0.4em}

% Allow page breaks and multiple pages
\\pagestyle{plain}

\\begin{document}
`;

const DOCUMENT_END = `\\end{document}`;

// ============ MAIN GENERATOR ============

/**
 * Generate LaTeX from ResumeData
 * 
 * This is the flexible generator - it builds LaTeX iteratively
 * from structured JSON, respecting section order.
 */
export const generateFlexibleLatex = (data: ResumeData): string => {
  // Apply soft guardrails first
  const guardedData = applyGuardrails(data);
  
  // Build sections in order
  const sectionOrder = normalizeSectionOrder(guardedData.sectionOrder);
  
  const sectionGenerators: Record<string, () => string> = {
    summary: () => generateSummary(guardedData.summary),
    skills: () => generateSkills(guardedData.skills),
    experience: () => generateExperience(guardedData.experience),
    education: () => generateEducation(guardedData.education),
    projects: () => generateProjects(guardedData.projects),
    certifications: () => generateCertifications(guardedData.certifications),
    awards: () => generateAwards(guardedData.awards),
    customSections: () => generateCustomSections(guardedData.customSections)
  };
  
  // Build document
  const parts: string[] = [
    DOCUMENT_PREAMBLE,
    generatePersonalInfo(guardedData)
  ];
  
  // Add sections in order
  sectionOrder.forEach(section => {
    const generator = sectionGenerators[section];
    if (generator) {
      const content = generator();
      if (content.trim()) {
        parts.push(content);
      }
    }
  });
  
  parts.push(DOCUMENT_END);
  
  return parts.join('\n');
};

// ============ EXPORT ALIAS ============
export const generateLatexFromResumeData = generateFlexibleLatex;
