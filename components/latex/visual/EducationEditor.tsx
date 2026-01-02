import React from 'react';
import { ResumeData } from '@/types/resume';
import { Plus, Trash2 } from 'lucide-react';

interface EducationEditorProps {
  data: ResumeData['education'];
  onChange: (data: ResumeData['education']) => void;
}

export default function EducationEditor({ data = [], onChange }: EducationEditorProps) {
  const safeData = data || [];
  
  const handleChange = (index: number, field: keyof NonNullable<ResumeData['education']>[0], value: string) => {
    const newData = [...safeData];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const handleAdd = () => {
    onChange([
      ...safeData,
      { school: 'New University', degree: 'Degree Name', year: '2024' }
    ]);
  };

  const handleRemove = (index: number) => {
    const newData = [...safeData];
    newData.splice(index, 1);
    onChange(newData);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Education</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>
      
      <div className="space-y-6">
        {safeData.map((edu, index) => (
          <div key={index} className="relative p-4 bg-gray-50 rounded-md border border-gray-200">
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => handleChange(index, 'school', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleChange(index, 'degree', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year / Duration</label>
                <input
                  type="text"
                  value={edu.year}
                  onChange={(e) => handleChange(index, 'year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
        
        {safeData.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">
            No education entries yet. Click "Add Education" to start.
          </div>
        )}
      </div>
    </div>
  );
}
