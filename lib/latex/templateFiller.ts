import { ResumeData } from '@/types/resume';

// ============ ESCAPING ============
const escapeTex = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
};

const escapeUrl = (url: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/%/g, '\\%').replace(/#/g, '\\#');
};

// ============ GUARDRAILS ============
const MAX_BULLETS_PER_ITEM = 3;
const MAX_BULLET_LENGTH = 180;

const trimBullet = (bullet: string): string => {
  if (bullet.length <= MAX_BULLET_LENGTH) return bullet;
  return bullet.substring(0, MAX_BULLET_LENGTH - 3) + '...';
};

const limitBullets = (bullets: string[]): string[] => {
  return bullets.slice(0, MAX_BULLETS_PER_ITEM).map(trimBullet);
};

// ============ SECTION GENERATORS (Locked Layout) ============

const generateEducationContent = (education: ResumeData['education']): string => {
  if (!education || education.length === 0) return '';
  
  return education.map(edu => {
    const gpaLine = edu.gpa ? ` \\hfill GPA: ${escapeTex(edu.gpa)}` : '';
    return `\\textbf{${escapeTex(edu.school || '')}}${gpaLine} \\hfill \\textit{${escapeTex(edu.year || '')}} \\\\
${escapeTex(edu.degree)}`;
  }).join('\n\\vspace{4pt}\n');
};

const generateSkillsContent = (skills: string[]): string => {
  if (!skills || skills.length === 0) return '';
  
  // Group skills by category if possible, otherwise just list them
  // For now, simple comma-separated list
  return `\\textbf{Technical Skills:} ${skills.map(escapeTex).join(', ')}`;
};

const generateExperienceContent = (experience: ResumeData['experience']): string => {
  if (!experience || experience.length === 0) return '';
  
  return experience.map(exp => {
    const bullets = limitBullets(exp.bullets || []);
    const location = exp.location ? `, ${escapeTex(exp.location)}` : '';
    
    // Only create itemize if there are bullets
    const bulletBlock = bullets.length > 0
      ? `\\begin{itemize}
${bullets.map(b => `    \\item ${escapeTex(b)}`).join('\n')}
\\end{itemize}`
      : '';
    
    return `\\textbf{${escapeTex(exp.role || '')}} \\hfill \\textit{${escapeTex(exp.startDate || '')} -- ${escapeTex(exp.endDate || '')}} \\\\
\\textit{${escapeTex(exp.company)}${location}}
${bulletBlock}`;
  }).join('\n\\vspace{2pt}\n');
};

const generateProjectsContent = (projects: ResumeData['projects']): string => {
  if (!projects || projects.length === 0) return '';
  
  return projects.map(proj => {
    const tech = proj.technologies && proj.technologies.length > 0 
      ? ` $|$ \\textit{${proj.technologies.map(escapeTex).join(', ')}}` 
      : '';
    const link = proj.link 
      ? ` \\hfill \\href{${proj.link}}{\\small Link}` 
      : '';
    
    // Only create itemize if there's a description
    const descBlock = proj.description && proj.description.trim()
      ? `\\begin{itemize}
    \\item ${escapeTex(trimBullet(proj.description))}
\\end{itemize}` 
      : '';
    
    return `\\textbf{${escapeTex(proj.name)}}${tech}${link}
${descBlock}`;
  }).join('\n\\vspace{2pt}\n');
};

const generateCertificationsSection = (certifications: ResumeData['certifications']): string => {
  if (!certifications || certifications.length === 0) return '';
  
  const items = certifications.map(cert => 
    `    \\item \\textbf{${escapeTex(cert.name || '')}} -- ${escapeTex(cert.issuer || '')} \\hfill \\textit{${escapeTex(cert.date || '')}}`
  ).join('\n');
  
  return `\\section{Certifications}
\\begin{itemize}
${items}
\\end{itemize}`;
};

const generateSummarySection = (summary: string): string => {
  if (!summary || summary.trim() === '') return '';
  return `\\section{Summary}
${escapeTex(summary)}`;
};

const generateCustomSections = (customSections: ResumeData['customSections']): string => {
  if (!customSections || customSections.length === 0) return '';
  
  return customSections.map(section => {
    // Handle content (paragraph format)
    if (section.content) {
      return `\\section{${escapeTex(section.title)}}\n${escapeTex(section.content)}`;
    }
    
    // Handle simple items (string[])
    const simpleItems = (section.items || []).map(item => escapeTex(item)).join('\n\\vspace{2pt}\n');
    
    // Handle detailed items
    const detailedItems = (section.detailedItems || []).map(item => {
      const bullets = item.bullets && item.bullets.length > 0
        ? `\\begin{itemize}\n${limitBullets(item.bullets).map(b => `    \\item ${escapeTex(b)}`).join('\n')}\n\\end{itemize}`
        : '';
      const nameLine = item.name ? `\\textbf{${escapeTex(item.name)}}` : '';
      const dateLine = item.date ? ` \\hfill \\textit{${escapeTex(item.date)}}` : '';
      const descLine = item.description ? `\\\\\n${escapeTex(item.description)}` : '';
      
      return `${nameLine}${dateLine}${descLine}\n${bullets}`;
    }).join('\n\\vspace{2pt}\n');
    
    const allItems = [simpleItems, detailedItems].filter(Boolean).join('\n\\vspace{2pt}\n');
    
    return `\\section{${escapeTex(section.title)}}\n${allItems}`;
  }).join('\n\n');
};

// ============ MAIN TEMPLATE FILLER ============

export const fillTemplate = (data: ResumeData): string => {
  // Use inline template (client-safe, no fs dependency)
  const template = getMasterTemplate();
  
  // Fill placeholders
  let filled = template
    // Header
    .replace('{{NAME}}', escapeTex(data.personalInfo.name))
    .replace('{{PHONE}}', escapeTex(data.personalInfo.phone))
    .replace('{{EMAIL}}', escapeTex(data.personalInfo.email))
    .replace(/\{\{GITHUB\}\}/g, escapeUrl(data.personalInfo.github || 'github.com'))
    .replace(/\{\{LINKEDIN\}\}/g, escapeUrl(data.personalInfo.linkedin || 'linkedin.com'))
    
    // Sections
    .replace('{{SUMMARY_SECTION}}', generateSummarySection(data.summary || ''))
    .replace('{{EDUCATION_CONTENT}}', generateEducationContent(data.education))
    .replace('{{SKILLS_CONTENT}}', generateSkillsContent(data.skills || []))
    .replace('{{EXPERIENCE_CONTENT}}', generateExperienceContent(data.experience))
    .replace('{{PROJECTS_CONTENT}}', generateProjectsContent(data.projects || []))
    .replace('{{CERTIFICATIONS_SECTION}}', generateCertificationsSection(data.certifications || []))
    .replace('{{CUSTOM_SECTIONS}}', generateCustomSections(data.customSections || []));
  
  return filled;
};

// Inline template for client-side usage
const getMasterTemplate = (): string => {
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\usepackage{xcolor}

\\pagenumbering{gobble}
\\setlength{\\parindent}{0pt}
\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=blue,
}

% Section Formatting
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}

% List Formatting - Tight spacing for single page
\\setlist[itemize]{leftmargin=*, nosep, topsep=1pt, itemsep=0pt}

\\begin{document}

% ============ HEADER (LOCKED) ============
\\begin{center}
    {\\LARGE \\textbf{{{NAME}}}} \\\\[4pt]
    {{PHONE}} \\;$|$\\; {{EMAIL}} \\;$|$\\; \\href{https://{{GITHUB}}}{{{GITHUB}}} \\;$|$\\; \\href{https://{{LINKEDIN}}}{{{LINKEDIN}}}
\\end{center}

\\vspace{-2pt}

% ============ SUMMARY (OPTIONAL) ============
{{SUMMARY_SECTION}}

% ============ EDUCATION (LOCKED) ============
\\section{Education}
{{EDUCATION_CONTENT}}

% ============ TECHNICAL SKILLS (LOCKED) ============
\\section{Technical Skills}
{{SKILLS_CONTENT}}

% ============ EXPERIENCE (LOCKED) ============
\\section{Experience}
{{EXPERIENCE_CONTENT}}

% ============ PROJECTS (LOCKED) ============
\\section{Projects}
{{PROJECTS_CONTENT}}

% ============ CERTIFICATIONS (LOCKED) ============
{{CERTIFICATIONS_SECTION}}

% ============ CUSTOM SECTIONS ============
{{CUSTOM_SECTIONS}}

\\end{document}`;
};

export default fillTemplate;
