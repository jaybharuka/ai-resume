import React from 'react';
import { ResumeData } from '@/types/resume';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ExperienceEditorProps {
  data: ResumeData['experience'];
  onChange: (data: ResumeData['experience']) => void;
}

export default function ExperienceEditor({ data = [], onChange }: ExperienceEditorProps) {
  const safeData = data || [];
  
  const handleChange = (index: number, field: keyof NonNullable<ResumeData['experience']>[0], value: any) => {
    const newData = [...safeData];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const handleBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
    const newData = [...safeData];
    const newBullets = [...(newData[expIndex].bullets || [])];
    newBullets[bulletIndex] = value;
    newData[expIndex] = { ...newData[expIndex], bullets: newBullets };
    onChange(newData);
  };

  const handleAddBullet = (expIndex: number) => {
    const newData = [...safeData];
    const newBullets = [...(newData[expIndex].bullets || []), 'New achievement or responsibility'];
    newData[expIndex] = { ...newData[expIndex], bullets: newBullets };
    onChange(newData);
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const newData = [...safeData];
    const newBullets = [...(newData[expIndex].bullets || [])];
    newBullets.splice(bulletIndex, 1);
    newData[expIndex] = { ...newData[expIndex], bullets: newBullets };
    onChange(newData);
  };

  const handleAdd = () => {
    onChange([
      ...safeData,
      { 
        company: 'Company Name', 
        role: 'Job Title', 
        startDate: 'Jan 2023', 
        endDate: 'Present', 
        bullets: ['Key achievement 1', 'Key achievement 2'] 
      }
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
        <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>
      
      <div className="space-y-6">
        {safeData.map((exp, index) => (
          <div key={index} className="relative p-4 bg-gray-50 rounded-md border border-gray-200">
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => handleChange(index, 'role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleChange(index, 'company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Key Achievements</label>
              {(exp.bullets || []).map((bullet, bIndex) => (
                <div key={bIndex} className="flex gap-2 items-start">
                  <div className="mt-2.5 text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  </div>
                  <textarea
                    value={bullet}
                    onChange={(e) => handleBulletChange(index, bIndex, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={() => handleRemoveBullet(index, bIndex)}
                    className="mt-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddBullet(index)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Bullet
              </button>
            </div>
          </div>
        ))}
        
        {safeData.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">
            No experience entries yet. Click "Add Experience" to start.
          </div>
        )}
      </div>
    </div>
  );
}
