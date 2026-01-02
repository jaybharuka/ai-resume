/**
 * Resume Guardrails & Validation Utilities
 * 
 * Soft constraints for AI-generated resume data.
 * These are POST-PROCESSING filters, not hard templates.
 */

import { ResumeData, Award } from '@/types/resume';

// ============ CONFIGURATION ============
export const GUARDRAILS = {
  maxBulletsPerRole: 20,  // Increased to show all bullets
  maxBulletLength: 500,   // Increased to show full bullet text
  maxSkillsCount: 100,    // Increased to show all skills
  maxProjectBullets: 10,  // Increased to show all project bullets
  preferredSectionOrder: [
    'summary',
    'education', 
    'skills',
    'experience',
    'projects',
    'certifications',
    'awards',
    'customSections'
  ]
};

// ============ BULLET GUARDRAILS ============

/**
 * Trim bullet to max length, preserving word boundaries
 */
export const trimBullet = (bullet: string, maxLength: number = GUARDRAILS.maxBulletLength): string => {
  if (!bullet || bullet.length <= maxLength) return bullet;
  
  // Find last space before max length
  const trimmed = bullet.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    return trimmed.substring(0, lastSpace) + '...';
  }
  return trimmed + '...';
};

/**
 * Limit bullets per experience/project
 */
export const limitBullets = (bullets: string[], max: number = GUARDRAILS.maxBulletsPerRole): string[] => {
  if (!bullets) return [];
  return bullets.slice(0, max).map(b => trimBullet(b));
};

// ============ SKILLS GUARDRAILS ============

/**
 * Remove duplicate skills (case-insensitive)
 */
export const deduplicateSkills = (skills: string[]): string[] => {
  if (!skills) return [];
  
  const seen = new Set<string>();
  return skills.filter(skill => {
    const normalized = skill.toLowerCase().trim();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

/**
 * Limit total skills count
 */
export const limitSkills = (skills: string[], max: number = GUARDRAILS.maxSkillsCount): string[] => {
  return deduplicateSkills(skills).slice(0, max);
};

// ============ SECTION ORDER ============

/**
 * Normalize section order, preserving detected order but filling gaps
 */
export const normalizeSectionOrder = (detected: string[] | undefined): string[] => {
  if (!detected || detected.length === 0) {
    return GUARDRAILS.preferredSectionOrder;
  }
  
  // Start with detected order
  const order = [...detected];
  
  // Add any missing standard sections at the end
  GUARDRAILS.preferredSectionOrder.forEach(section => {
    if (!order.includes(section)) {
      order.push(section);
    }
  });
  
  return order;
};

// ============ APPLY ALL GUARDRAILS ============

/**
 * Apply soft guardrails to ResumeData
 * This does NOT change structure, preserves all content
 */
export const applyGuardrails = (data: ResumeData): ResumeData => {
  return {
    ...data,
    
    // Keep all experience bullets without truncation
    experience: data.experience?.map(exp => ({
      ...exp,
      bullets: exp.bullets || []
    })) || [],
    
    // Keep full project descriptions
    projects: data.projects?.map(proj => ({
      ...proj,
      description: proj.description || ''
    })) || [],
    
    // Dedupe skills but don't limit count
    skills: deduplicateSkills(data.skills || []),
    
    // Normalize section order
    sectionOrder: normalizeSectionOrder(data.sectionOrder)
  };
};

// ============ CONTENT PARITY VALIDATION ============

export interface ParityWarning {
  type: 'missing_section' | 'missing_role' | 'missing_skills' | 'content_mismatch';
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Validate that extracted data matches original text
 * Returns warnings (non-blocking)
 */
export const validateContentParity = (
  originalText: string, 
  extractedData: ResumeData
): ParityWarning[] => {
  const warnings: ParityWarning[] = [];
  const textLower = originalText.toLowerCase();
  
  // Check if major sections are present
  const sectionKeywords = {
    experience: ['experience', 'work history', 'employment'],
    education: ['education', 'academic', 'degree'],
    skills: ['skills', 'technologies', 'technical'],
    projects: ['projects', 'portfolio']
  };
  
  // Check experience companies
  if (extractedData.experience) {
    extractedData.experience.forEach(exp => {
      if (exp.company && !textLower.includes(exp.company.toLowerCase().substring(0, 10))) {
        warnings.push({
          type: 'content_mismatch',
          message: `Company "${exp.company}" may not match original text`,
          severity: 'warning'
        });
      }
    });
  }
  
  // Check for missing sections
  Object.entries(sectionKeywords).forEach(([section, keywords]) => {
    const hasInText = keywords.some(kw => textLower.includes(kw));
    const hasInData = section === 'experience' ? (extractedData.experience?.length || 0) > 0
      : section === 'education' ? (extractedData.education?.length || 0) > 0
      : section === 'skills' ? (extractedData.skills?.length || 0) > 0
      : section === 'projects' ? (extractedData.projects?.length || 0) > 0
      : false;
    
    if (hasInText && !hasInData) {
      warnings.push({
        type: 'missing_section',
        message: `Section "${section}" appears in text but not in extracted data`,
        severity: 'warning'
      });
    }
  });
  
  return warnings;
};

// ============ GENERATION MODES ============

export type GenerationMode = 'strict' | 'flexible';

export interface GenerationConfig {
  mode: GenerationMode;
  preserveOriginalWording: boolean;
  improveActionVerbs: boolean;
  addMetrics: boolean;
}

export const getGenerationConfig = (mode: GenerationMode): GenerationConfig => {
  if (mode === 'strict') {
    return {
      mode: 'strict',
      preserveOriginalWording: true,
      improveActionVerbs: false,
      addMetrics: false
    };
  }
  
  return {
    mode: 'flexible',
    preserveOriginalWording: false,
    improveActionVerbs: true,
    addMetrics: false // Never add fake metrics
  };
};
