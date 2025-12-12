import ModernTemplate from './ModernTemplate';
import MinimalistTemplate from './MinimalistTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import CreativeTemplate from './CreativeTemplate';
import TechTemplate from './TechTemplate';
import IvyTemplate from './IvyTemplate';
import StartupTemplate from './StartupTemplate';
import GlitchTemplate from './GlitchTemplate';

export const templates = {
  'modern': ModernTemplate,
  'minimalist': MinimalistTemplate,
  'executive': ExecutiveTemplate,
  'creative': CreativeTemplate,
  'tech': TechTemplate,
  'ivy': IvyTemplate,
  'startup': StartupTemplate,
  'glitch': GlitchTemplate,
};

export type TemplateName = keyof typeof templates;
