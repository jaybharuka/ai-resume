import React from 'react';
import { ResumeData } from '@/types/resume';
import { templates, TemplateName } from './templates';

interface ResumePreviewProps {
  data: ResumeData;
  templateName: TemplateName;
  id?: string;
  colorAccent?: string;
  isEditing?: boolean;
  onUpdate?: (data: ResumeData) => void;
  scale?: number;
}

export default function ResumePreview({ 
  data, 
  templateName, 
  id, 
  colorAccent = '#3b82f6',
  isEditing = false,
  onUpdate,
  scale = 1
}: ResumePreviewProps) {
  
  // Fallback to 'modern' if the template name is invalid or missing
  const TemplateComponent = templates[templateName] || templates['modern'];

  return (
    <div 
      id={id} 
      className="w-[210mm] min-h-[297mm] bg-white shadow-2xl mb-10 overflow-hidden relative transition-all duration-300 ease-in-out"
      style={{ 
        zoom: scale,
        pageBreakInside: 'avoid',
        transformOrigin: 'top center'
      }}
    >
      <TemplateComponent 
        data={data} 
        colorAccent={colorAccent} 
        isEditing={isEditing} 
        onUpdate={onUpdate} 
      />
    </div>
  );
}
