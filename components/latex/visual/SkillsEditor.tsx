import React from 'react';
import { ResumeData } from '@/types/resume';

interface SkillsEditorProps {
  data: ResumeData['skills'];
  onChange: (data: ResumeData['skills']) => void;
}

export default function SkillsEditor({ data, onChange }: SkillsEditorProps) {
  const handleChange = (value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(s => s);
    onChange(skills);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Skills</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Technical Skills (comma separated)</label>
        <textarea
          value={data.join(', ')}
          onChange={(e) => handleChange(e.target.value)}
          rows={4}
          placeholder="Java, Python, React, Node.js, AWS..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter your skills separated by commas. These will be formatted as a list in your resume.
        </p>
      </div>
    </div>
  );
}
