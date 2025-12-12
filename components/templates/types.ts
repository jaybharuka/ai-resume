import { ResumeData } from '@/types/resume';

export interface TemplateProps {
  data: ResumeData;
  colorAccent: string;
  isEditing: boolean;
  onUpdate?: (data: ResumeData) => void;
}
