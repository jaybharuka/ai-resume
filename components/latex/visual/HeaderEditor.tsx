import React from 'react';
import { ResumeData } from '@/types/resume';

interface HeaderEditorProps {
  data: ResumeData['personalInfo'];
  onChange: (data: ResumeData['personalInfo']) => void;
}

export default function HeaderEditor({ data, onChange }: HeaderEditorProps) {
  const handleChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (Optional)</label>
          <input
            type="text"
            value={data.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub (Optional)</label>
          <input
            type="text"
            value={data.github || ''}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="github.com/username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
