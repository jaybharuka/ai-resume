import { ResumeData } from '@/types/resume';

const escapeTex = (str: string) => {
  if (!str) return '';
  return str.replace(/\\/g, '\\textbackslash{}')
            .replace(/&/g, '\\&')
            .replace(/%/g, '\\%')
            .replace(/\$/g, '\\$')
            .replace(/#/g, '\\#')
            .replace(/_/g, '\\_')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\~/g, '\\textasciitilde')
            .replace(/\^/g, '\\textasciicircum');
};

const escapeUrl = (url: string) => {
  if (!url) return '';
  return url.replace(/%/g, '\\%').replace(/#/g, '\\#');
};

export const generateModernLatex = (data: ResumeData): string => {
  let tex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.6in]{geometry}
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
\\titlespacing*{\\section}{0pt}{10pt}{6pt}

% List Formatting
\\setlist[itemize]{leftmargin=*, nosep, topsep=2pt}

\\begin{document}

% Header
\\begin{center}
    {\\LARGE \\textbf{${escapeTex(data.personalInfo.name)}}} \\\\
    \\vspace{4pt}
    ${escapeTex(data.personalInfo.phone)} $|$ ${escapeTex(data.personalInfo.email)}
    ${data.personalInfo.linkedin ? ` $|$ \\href{https://${escapeUrl(data.personalInfo.linkedin.replace(/^https?:\/\//, ''))}}{${escapeTex(data.personalInfo.linkedin.replace(/^https?:\/\//, ''))}}` : ''}
    ${data.personalInfo.github ? ` $|$ \\href{https://${escapeUrl(data.personalInfo.github.replace(/^https?:\/\//, ''))}}{${escapeTex(data.personalInfo.github.replace(/^https?:\/\//, ''))}}` : ''}
\\end{center}

`;

  const defaultOrder = ['summary', 'education', 'experience', 'projects', 'skills'];
  const order = data.sectionOrder && data.sectionOrder.length > 0 
    ? Array.from(new Set(data.sectionOrder)) 
    : defaultOrder;

  // Add any missing sections to the end
  defaultOrder.forEach(section => {
    if (!order.includes(section)) {
      order.push(section);
    }
  });

  order.forEach(section => {
    if (section === 'summary' && data.summary) {
      tex += `\\section{Summary}
${escapeTex(data.summary)}
`;
    } else if (section === 'education' && data.education && data.education.length > 0) {
      tex += `\\section{Education}
`;
      data.education.forEach(edu => {
        tex += `\\textbf{${escapeTex(edu.school || '')}} \\hfill ${escapeTex(edu.year || '')} \\\\
\\textit{${escapeTex(edu.degree)}}
\\vspace{4pt}
`;
      });
    } else if (section === 'experience' && data.experience && data.experience.length > 0) {
      tex += `\\section{Experience}
`;
      data.experience.forEach(exp => {
        tex += `\\textbf{${escapeTex(exp.role || '')}} \\hfill ${escapeTex(exp.startDate || '')} -- ${escapeTex(exp.endDate || '')} \\\\
\\textit{${escapeTex(exp.company)}}
\\begin{itemize}
`;
        (exp.bullets || []).forEach(bullet => {
          tex += `    \\item ${escapeTex(bullet)}
`;
        });
        tex += `\\end{itemize}
\\vspace{4pt}
`;
      });
    } else if (section === 'projects' && data.projects && data.projects.length > 0) {
      tex += `\\section{Projects}
`;
      data.projects.forEach(proj => {
        tex += `\\textbf{${escapeTex(proj.name)}} ${proj.technologies && proj.technologies.length > 0 ? `\\textit{ | ${escapeTex(proj.technologies.join(', '))}}` : ''} \\\\
\\begin{itemize}
    \\item ${escapeTex(proj.description)}
\\end{itemize}
\\vspace{4pt}
`;
      });
    } else if (section === 'skills' && data.skills && data.skills.length > 0) {
      tex += `\\section{Technical Skills}
${escapeTex(data.skills.join(', '))}
`;
    }
  });

  tex += `
\\end{document}
`;

  return tex;
};
