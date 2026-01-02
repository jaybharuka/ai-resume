import { ResumeData } from '@/types/resume';
import { parseLatexWithAST } from './latexParser';
import { generateFlexibleLatex } from './flexibleGenerator';
import { GenerationMode } from '@/lib/resume/guardrails';

export const parseLatexToJSON = (latex: string): ResumeData => {
  return parseLatexWithAST(latex);
};

/**
 * Generate LaTeX from ResumeData using flexible AI-driven approach
 * 
 * This is NOT a locked template - it builds LaTeX iteratively
 * from structured JSON with soft guardrails.
 */
export const generateLatexFromJSON = (
  data: ResumeData, 
  mode: GenerationMode = 'flexible'
): string => {
  return generateFlexibleLatex(data);
};
