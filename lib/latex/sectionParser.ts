/**
 * LaTeX Section Parser
 * 
 * Extracts section titles from LaTeX code for dynamic section detection.
 */

/**
 * Convert LaTeX section content to human-readable plain text
 * Strips LaTeX commands while preserving content structure
 * 
 * @param latexContent - The LaTeX content to convert
 * @returns Plain text representation of the content
 */
export function latexToPlainText(latexContent: string): string {
  if (!latexContent) return '';

  let text = latexContent;

  // Remove section header but keep title
  text = text.replace(/\\section\*?\{([^}]+)\}/g, '$1\n\n');

  // Convert itemize/enumerate to bullet points
  text = text.replace(/\\begin\{itemize\}/g, '');
  text = text.replace(/\\end\{itemize\}/g, '');
  text = text.replace(/\\begin\{enumerate\}/g, '');
  text = text.replace(/\\end\{enumerate\}/g, '');
  text = text.replace(/\\item\s*/g, '• ');

  // Handle text formatting - extract content
  text = text.replace(/\\textbf\{([^}]*)\}/g, '$1');
  text = text.replace(/\\textit\{([^}]*)\}/g, '$1');
  text = text.replace(/\\underline\{([^}]*)\}/g, '$1');
  text = text.replace(/\\emph\{([^}]*)\}/g, '$1');

  // Handle links - show URL or text
  text = text.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2');
  text = text.replace(/\\url\{([^}]*)\}/g, '$1');

  // Remove common LaTeX commands
  text = text.replace(/\\noindent/g, '');
  text = text.replace(/\\hfill/g, '  ');
  text = text.replace(/\\quad/g, '  ');
  text = text.replace(/\\qquad/g, '    ');
  text = text.replace(/\\newline/g, '\n');
  text = text.replace(/\\\\/g, '\n');
  text = text.replace(/\\vspace\{[^}]*\}/g, '\n');
  text = text.replace(/\\hspace\{[^}]*\}/g, ' ');
  text = text.replace(/\\smallskip/g, '\n');
  text = text.replace(/\\medskip/g, '\n');
  text = text.replace(/\\bigskip/g, '\n\n');

  // Remove font size commands
  text = text.replace(/\\(tiny|scriptsize|footnotesize|small|normalsize|large|Large|LARGE|huge|Huge)\b/g, '');

  // Handle special characters
  text = text.replace(/\\&/g, '&');
  text = text.replace(/\\%/g, '%');
  text = text.replace(/\\\$/g, '$');
  text = text.replace(/\\#/g, '#');
  text = text.replace(/\\_/g, '_');
  text = text.replace(/\\{/g, '{');
  text = text.replace(/\\}/g, '}');
  text = text.replace(/~/g, ' ');
  text = text.replace(/``/g, '"');
  text = text.replace(/''/g, '"');
  text = text.replace(/`/g, "'");
  text = text.replace(/\\textbar/g, '|');
  text = text.replace(/\\textbackslash/g, '\\');

  // Remove any remaining LaTeX commands (generic cleanup)
  text = text.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1');
  text = text.replace(/\\[a-zA-Z]+/g, '');

  // Clean up extra whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  // Clean up lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  return lines.join('\n');
}

/**
 * Parse LaTeX code and extract all section titles
 * Matches both \section{...} and \section*{...}
 * 
 * @param latexCode - The LaTeX source code to parse
 * @returns Array of section titles as plain strings
 * 
 * @example
 * const sections = extractSectionTitles(latexCode)
 * // Returns: ["PROFILE", "EDUCATION", "EXPERIENCE", "PROJECTS"]
 */
export function extractSectionTitles(latexCode: string): string[] {
  if (!latexCode) return [];
  
  // Match \section{...} and \section*{...}
  // The regex captures the content inside the braces
  const sectionRegex = /\\section\*?\{([^}]+)\}/g;
  
  const sections: string[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = sectionRegex.exec(latexCode)) !== null) {
    const sectionTitle = match[1].trim();
    if (sectionTitle && !sections.includes(sectionTitle)) {
      sections.push(sectionTitle);
    }
  }
  
  return sections;
}

/**
 * Extract a specific section by title from LaTeX code
 * Captures everything from \section{TITLE} until the next section or EOF
 * 
 * @param latexCode - The full LaTeX source code
 * @param sectionTitle - The title of the section to extract
 * @returns The full LaTeX block including \section{...}, or null if not found
 * 
 * @example
 * const experienceSection = extractSectionByTitle(latexCode, "Experience")
 * // Returns: "\section*{Experience}\n\noindent\textbf{Software Engineer}..."
 */
export function extractSectionByTitle(latexCode: string, sectionTitle: string): string | null {
  if (!latexCode || !sectionTitle) return null;
  
  // Escape special regex characters in the section title
  const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Match the section start (both \section{} and \section*{})
  // Then capture everything until the next \section or \end{document} or EOF
  const sectionStartRegex = new RegExp(
    `(\\\\section\\*?\\{${escapedTitle}\\})`,
    'i'
  );
  
  const startMatch = sectionStartRegex.exec(latexCode);
  if (!startMatch) return null;
  
  const startIndex = startMatch.index;
  
  // Find the next section or end of document
  const remainingCode = latexCode.substring(startIndex + startMatch[0].length);
  
  // Look for next \section{} or \section*{} or \end{document}
  const nextSectionRegex = /\\section\*?\{|\\end\{document\}/;
  const nextMatch = nextSectionRegex.exec(remainingCode);
  
  let endIndex: number;
  if (nextMatch) {
    endIndex = startIndex + startMatch[0].length + nextMatch.index;
  } else {
    // No next section found, take until end of document
    endIndex = latexCode.length;
  }
  
  // Extract the section content and trim trailing whitespace
  const sectionContent = latexCode.substring(startIndex, endIndex).trimEnd();
  
  return sectionContent;
}

/**
 * Validate that the new section LaTeX is valid for replacement
 * 
 * @param newSectionLatex - The AI-generated section LaTeX
 * @param expectedTitle - The expected section title
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateSectionLatex(
  newSectionLatex: string,
  expectedTitle: string
): { isValid: boolean; error?: string } {
  if (!newSectionLatex || !newSectionLatex.trim()) {
    return { isValid: false, error: 'New section content is empty' };
  }

  // Check that it starts with \section or \section*
  const startsWithSection = /^\s*\\section\*?\{/.test(newSectionLatex);
  if (!startsWithSection) {
    return { isValid: false, error: 'New section must start with \\section{} or \\section*{}' };
  }

  // Extract the section title from the new LaTeX
  const titleMatch = newSectionLatex.match(/\\section\*?\{([^}]+)\}/);
  if (!titleMatch) {
    return { isValid: false, error: 'Could not find section title in new LaTeX' };
  }

  const newTitle = titleMatch[1].trim();
  const normalizedExpected = expectedTitle.trim().toLowerCase();
  const normalizedNew = newTitle.toLowerCase();

  // Allow case-insensitive match
  if (normalizedNew !== normalizedExpected) {
    return { 
      isValid: false, 
      error: `Section title mismatch: expected "${expectedTitle}" but got "${newTitle}"` 
    };
  }

  return { isValid: true };
}

/**
 * Replace a section in LaTeX code with new content
 * 
 * @param latexCode - The full LaTeX source code
 * @param sectionTitle - The title of the section to replace
 * @param newSectionLatex - The new LaTeX content for the section
 * @returns Object with success boolean, updated LaTeX, and error if failed
 * 
 * @example
 * const result = replaceSectionByTitle(latexCode, "Experience", newExperienceLatex)
 * if (result.success) {
 *   // Use result.latex
 * }
 */
export function replaceSectionByTitle(
  latexCode: string,
  sectionTitle: string,
  newSectionLatex: string
): { success: boolean; latex?: string; error?: string } {
  if (!latexCode || !sectionTitle) {
    return { success: false, error: 'Missing LaTeX code or section title' };
  }

  // Validate the new section LaTeX
  const validation = validateSectionLatex(newSectionLatex, sectionTitle);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  // Escape special regex characters in the section title
  const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match the section start (both \section{} and \section*{})
  const sectionStartRegex = new RegExp(
    `(\\\\section\\*?\\{${escapedTitle}\\})`,
    'i'
  );

  const startMatch = sectionStartRegex.exec(latexCode);
  if (!startMatch) {
    return { success: false, error: `Section "${sectionTitle}" not found in LaTeX` };
  }

  const startIndex = startMatch.index;

  // Find the end of this section (next \section or \end{document})
  const remainingCode = latexCode.substring(startIndex + startMatch[0].length);
  const nextSectionRegex = /\\section\*?\{|\\end\{document\}/;
  const nextMatch = nextSectionRegex.exec(remainingCode);

  let endIndex: number;
  if (nextMatch) {
    endIndex = startIndex + startMatch[0].length + nextMatch.index;
  } else {
    endIndex = latexCode.length;
  }

  // Get the content before and after the section
  const beforeSection = latexCode.substring(0, startIndex);
  const afterSection = latexCode.substring(endIndex);

  // Determine appropriate whitespace
  // Check if there's whitespace before the next section
  const needsTrailingNewlines = afterSection.trim().length > 0 && !afterSection.startsWith('\n\n');
  const trimmedNewSection = newSectionLatex.trimEnd();
  
  // Build the updated LaTeX
  let updatedLatex = beforeSection + trimmedNewSection;
  
  // Add appropriate spacing before next content
  if (afterSection.trim().length > 0) {
    // There's content after - ensure proper spacing
    if (!afterSection.startsWith('\n')) {
      updatedLatex += '\n\n';
    }
  }
  
  updatedLatex += afterSection;

  return { success: true, latex: updatedLatex };
}

/**
 * Common actions for section tailoring
 */
export const TAILOR_ACTIONS = [
  { value: 'rewrite_for_jd', label: 'Rewrite for JD' },
  { value: 'improve_clarity', label: 'Improve clarity' },
  { value: 'optimize_ats', label: 'Optimize for ATS' },
  { value: 'shorten', label: 'Shorten' },
] as const;

export type TailorAction = typeof TAILOR_ACTIONS[number]['value'];
