import { latexParser } from 'latex-utensils';
import { ResumeData } from '@/types/resume';

// Helper to extract plain text from AST nodes
const extractText = (nodes: any[] | any): string => {
  if (!nodes) return '';
  if (Array.isArray(nodes)) {
    return nodes.map(extractText).join('');
  }
  
  if (nodes.kind === 'text.string') {
    return nodes.content;
  }
  
  if (nodes.kind === 'command') {
    // Handle common commands like \textbf, \textit, \href
    if (nodes.name === 'textbf' || nodes.name === 'textit' || nodes.name === 'emph') {
      return extractText(nodes.args[0].content);
    }
    if (nodes.name === 'href') {
      // \href{url}{text} -> return text
      return extractText(nodes.args[1].content);
    }
    if (nodes.name === '&') return '&';
    if (nodes.name === '$') return '$';
    if (nodes.name === '%') return '%';
    if (nodes.name === '#') return '#';
    if (nodes.name === '_') return '_';
    
    // For other commands, just try to extract args if possible
    if (nodes.args && nodes.args.length > 0) {
      return nodes.args.map((arg: any) => extractText(arg.content)).join(' ');
    }
  }

  if (nodes.kind === 'environment') {
    return extractText(nodes.content);
  }

  if (nodes.kind === 'parbreak') {
    return '\n';
  }
  
  if (nodes.kind === 'space') {
    return ' ';
  }

  if (nodes.kind === 'softbreak') {
    return '\n';
  }

  return '';
};

// Helper to find specific sections in AST
const findSections = (ast: any) => {
  const sections: { title: string; content: any[] }[] = [];
  let currentSection: { title: string; content: any[] } | null = null;

  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.kind === 'command' && node.name === 'section') {
        const title = extractText(node.args[0].content).toLowerCase();
        currentSection = { title, content: [] };
        sections.push(currentSection);
      } else if (currentSection) {
        currentSection.content.push(node);
      }
    }
  };

  traverse(ast.content);
  return sections;
};

export const parseLatexWithAST = (code: string): ResumeData => {
  const data: ResumeData = {
    personalInfo: { name: '', email: '', phone: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: []
  };

  try {
    const ast = latexParser.parse(code);

    // 1. Extract Header (Personal Info)
    // Usually in 'center' environment or at the beginning before any section
    const findHeader = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.kind === 'environment' && node.name === 'center') {
          const text = extractText(node.content);
          // Simple regex extraction from the plain text of the header
          const nameMatch = text.match(/^([A-Za-z\s\.]+)/); // Assume name is first
          if (nameMatch) data.personalInfo.name = nameMatch[1].trim();

          const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
          if (emailMatch) data.personalInfo.email = emailMatch[1];

          const phoneMatch = text.match(/(\+?[\d\-\s]{10,})/);
          if (phoneMatch) data.personalInfo.phone = phoneMatch[1].trim();

          const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
          if (linkedinMatch) data.personalInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;

          const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/);
          if (githubMatch) data.personalInfo.github = `github.com/${githubMatch[1]}`;
          
          return; // Found header
        }
      }
    };
    findHeader(ast.content);

    // 2. Process Sections
    const sections = findSections(ast);
    data.sectionOrder = [];

    for (const section of sections) {
      const title = section.title;
      const contentNodes = section.content;

      if (title.includes('education')) {
        data.sectionOrder.push('education');
        // Parse Education
        // Look for patterns like: \textbf{School} \hfill Year \\ \textit{Degree}
        // We can iterate through contentNodes and group by textbf or parbreaks
        
        let currentEdu: any = {};
        
        // Simplified traversal for education blocks
        // We look for textbf (School) and textit (Degree)
        const text = extractText(contentNodes);
        // Fallback to regex on the extracted text for this section if AST structure is too flat
        // But let's try to use AST structure if possible.
        // Often structure is:
        // textbf{School} ... textit{Degree} ...
        
        // Let's use a simpler block splitter based on the extracted text for now, 
        // as AST traversal for unstructured text is hard.
        // But we can use the AST to identify the commands.
        
        // Better approach: Split contentNodes by empty lines or specific markers?
        // Let's stick to the text extraction + regex for the *content* of the section,
        // which is already 300% better than regexing the whole file because we isolated the section.
        
        const blocks = text.split('\n\n').filter(b => b.trim().length > 5);
        
        data.education = blocks.map(block => {
          const schoolMatch = block.match(/^([^\n]+)/); // First line often school
          const degreeMatch = block.match(/Degree|Bachelor|Master|B\.Tech|M\.Tech|PhD|B\.S\.|M\.S\./i) 
            ? block.match(/([^\n]*(?:Degree|Bachelor|Master|B\.Tech|M\.Tech|PhD|B\.S\.|M\.S\.)[^\n]*)/i)
            : null;
          const yearMatch = block.match(/(\d{4}|\d{4}\s*--\s*\d{4}|Present|Expected)/i);

          return {
            school: schoolMatch ? schoolMatch[1].trim() : '',
            degree: degreeMatch ? degreeMatch[1].trim() : '',
            year: yearMatch ? yearMatch[0].trim() : ''
          };
        });

      } else if (title.includes('experience')) {
        data.sectionOrder.push('experience');
        // Experience usually has itemize
        // We can look for 'itemize' environments in the contentNodes
        
        // We need to group content before itemize as the header (Role, Company, Date)
        // and the itemize as bullets.
        
        const expBlocks: any[] = [];
        let currentExp: any = { bullets: [] };
        let bufferNodes: any[] = [];

        for (const node of contentNodes) {
          if (node.kind === 'environment' && node.name === 'itemize') {
            // Process bullets
            const bullets: string[] = [];
            for (const item of node.content) {
              if (item.kind === 'command' && item.name === 'item') {
                // The content of item follows the command until next item
                // latex-utensils might structure itemize content differently
                // Actually latex-utensils puts item content in the array after the item command?
                // No, usually it's a list of nodes.
                // Let's just extract text from the itemize env and split by bullet char if needed
                // Or better:
              }
            }
            // Simpler: extract text of itemize and split by \item (which extractText might skip or we handle)
            // Let's handle 'item' command in extractText? No, 'item' is a command.
            
            // Let's extract text from the itemize node specifically
            // We need to handle the itemize structure manually here
            const itemizeText = node.content.map((n: any) => {
               if (n.kind === 'command' && n.name === 'item') return 'ITEM_MARKER';
               return extractText(n);
            }).join('');
            
            currentExp.bullets = itemizeText.split('ITEM_MARKER').filter((s: string) => s.trim()).map((s: string) => s.trim());
            
            // Process buffer for Role/Company
            const headerText = extractText(bufferNodes);
            const roleMatch = headerText.match(/^([^\n]+)/);
            const companyMatch = headerText.match(/(?:at|@|\|)\s*([^\n]+)/) || headerText.match(/\n([^\n]+)/); // Second line or after separator
            const dateMatch = headerText.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}\s*--\s*(?:Present|\w+\s*\d{4}))/i);

            currentExp.role = roleMatch ? roleMatch[1].trim() : '';
            currentExp.company = companyMatch ? companyMatch[1].trim() : '';
            if (dateMatch) {
                const dates = dateMatch[1].split('--');
                currentExp.startDate = dates[0].trim();
                currentExp.endDate = dates[1].trim();
            }

            expBlocks.push(currentExp);
            currentExp = { bullets: [] };
            bufferNodes = [];
          } else {
            bufferNodes.push(node);
          }
        }
        data.experience = expBlocks;

      } else if (title.includes('project')) {
        data.sectionOrder.push('projects');
        // Similar to experience
        const projBlocks: any[] = [];
        let currentProj: any = { technologies: [] };
        let bufferNodes: any[] = [];

        for (const node of contentNodes) {
          if (node.kind === 'environment' && node.name === 'itemize') {
             const itemizeText = node.content.map((n: any) => {
               if (n.kind === 'command' && n.name === 'item') return 'ITEM_MARKER';
               return extractText(n);
            }).join('');
            
            const bullets = itemizeText.split('ITEM_MARKER').filter((s: string) => s.trim()).map((s: string) => s.trim());
            currentProj.description = bullets.join('. ');

            // Header
            const headerText = extractText(bufferNodes);
            const nameMatch = headerText.match(/^([^\n|]+)/);
            const techMatch = headerText.match(/\|(.+)/); // Often separated by |

            currentProj.name = nameMatch ? nameMatch[1].trim() : '';
            if (techMatch) {
                currentProj.technologies = techMatch[1].split(',').map((t: string) => t.trim());
            }

            projBlocks.push(currentProj);
            currentProj = { technologies: [] };
            bufferNodes = [];
          } else {
            bufferNodes.push(node);
          }
        }
        data.projects = projBlocks;

      } else if (title.includes('skill')) {
        data.sectionOrder.push('skills');
        const text = extractText(contentNodes);
        // Remove "Technical Skills:" prefix if present
        const cleanText = text.replace(/Technical Skills:|Skills:|Languages:/gi, '');
        data.skills = cleanText.split(',').map(s => s.trim()).filter(s => s);
      } else if (title.includes('summary')) {
        data.sectionOrder.push('summary');
        data.summary = extractText(contentNodes).trim();
      }
    }

  } catch (e) {
    console.error("AST Parsing failed, falling back to regex:", e);
    return parseLatexWithRegex(code);
  }

  return data;
};

const parseLatexWithRegex = (latex: string): ResumeData => {
  const data: ResumeData = {
    personalInfo: { name: '', email: '', phone: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: []
  };

  try {
    // Helper to clean LaTeX commands
    const cleanTex = (str: string) => str.replace(/\\textbf\{([^}]+)\}/g, '$1')
                                        .replace(/\\textit\{([^}]+)\}/g, '$1')
                                        .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, '$1')
                                        .replace(/\\&/g, '&')
                                        .replace(/\\%/g, '%')
                                        .replace(/\\$/g, '$')
                                        .trim();

    // 1. Extract Personal Info
    const nameMatch = latex.match(/\\textbf\{([A-Za-z\s\.]+)\}/);
    if (nameMatch) data.personalInfo.name = nameMatch[1];

    const emailMatch = latex.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
    if (emailMatch) data.personalInfo.email = emailMatch[1];

    const phoneMatch = latex.match(/(\+?[\d\-\s]{10,})/);
    if (phoneMatch) data.personalInfo.phone = phoneMatch[1].trim();

    const linkedinMatch = latex.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
    if (linkedinMatch) data.personalInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;

    const githubMatch = latex.match(/github\.com\/([a-zA-Z0-9-]+)/);
    if (githubMatch) data.personalInfo.github = `github.com/${githubMatch[1]}`;

    // 2. Split into sections
    const sections = latex.split(/\\section\{([^}]+)\}/);
    data.sectionOrder = [];
    
    for (let i = 1; i < sections.length; i += 2) {
      const sectionTitle = sections[i].toLowerCase();
      const sectionContent = sections[i + 1];

      if (sectionTitle.includes('experience')) {
        data.sectionOrder.push('experience');
        const blocks = sectionContent.split(/\\textbf\{/);
        blocks.shift();

        data.experience = blocks.map(block => {
          const roleMatch = block.match(/^([^}]+)\}/);
          const role = roleMatch ? roleMatch[1] : '';
          
          const companyMatch = block.match(/\\textit\{([^}]+)\}/);
          const company = companyMatch ? companyMatch[1] : '';

          const dateMatch = block.match(/\\hfill\s*([A-Za-z0-9\s\-\–]+)\s*\\\\/);
          const date = dateMatch ? dateMatch[1] : '';
          
          const itemizeMatch = block.match(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/);
          const bullets = itemizeMatch 
            ? itemizeMatch[1].split('\\item').slice(1).map(b => cleanTex(b.trim()))
            : [];

          return {
            role,
            company,
            startDate: date.split('-')[0]?.trim() || '',
            endDate: date.split('-')[1]?.trim() || '',
            bullets
          };
        });

      } else if (sectionTitle.includes('education')) {
        data.sectionOrder.push('education');
        const blocks = sectionContent.split(/\\textbf\{/);
        blocks.shift();

        data.education = blocks.map(block => {
          const schoolMatch = block.match(/^([^}]+)\}/);
          const school = schoolMatch ? schoolMatch[1] : '';

          const degreeMatch = block.match(/\\textit\{([^}]+)\}/);
          const degree = degreeMatch ? degreeMatch[1] : '';

          const dateMatch = block.match(/\\hfill\s*([A-Za-z0-9\s\-\–]+)/);
          const year = dateMatch ? dateMatch[1] : '';

          return {
            school,
            degree,
            year
          };
        });

      } else if (sectionTitle.includes('project')) {
        data.sectionOrder.push('projects');
        const blocks = sectionContent.split(/\\textbf\{/);
        blocks.shift();

        data.projects = blocks.map(block => {
          const nameMatch = block.match(/^([^}]+)\}/);
          const name = nameMatch ? nameMatch[1] : '';

          const techMatch = block.match(/\\textit\{\s*\|\s*([^}]+)\}/);
          const technologies = techMatch ? techMatch[1].split(',').map(t => t.trim()) : [];

          const itemizeMatch = block.match(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/);
          const description = itemizeMatch 
            ? itemizeMatch[1].split('\\item').slice(1).map(b => cleanTex(b.trim())).join('. ')
            : '';

          return {
            name,
            description,
            technologies
          };
        });

      } else if (sectionTitle.includes('skill') || sectionTitle.includes('technical')) {
        data.sectionOrder.push('skills');
        const lines = sectionContent.split('\\\\');
        const allSkills: string[] = [];
        lines.forEach(line => {
          const cleanLine = cleanTex(line);
          if (cleanLine) {
            const skills = cleanLine.replace(/^[^:]+:\s*/, '').split(',').map(s => s.trim());
            allSkills.push(...skills);
          }
        });
        data.skills = allSkills.filter(s => s);
      } else if (sectionTitle.includes('summary')) {
        data.sectionOrder.push('summary');
        data.summary = cleanTex(sectionContent);
      }
    }
  } catch (e) {
    console.error("Regex parsing failed:", e);
  }
  return data;
};
