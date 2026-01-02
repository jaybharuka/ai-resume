import React from 'react';
import { ResumeData } from '@/types/resume';
import { Plus, Trash2 } from 'lucide-react';

interface ProjectsEditorProps {
  data: ResumeData['projects'];
  onChange: (data: ResumeData['projects']) => void;
}

export default function ProjectsEditor({ data = [], onChange }: ProjectsEditorProps) {
  const handleChange = (index: number, field: keyof NonNullable<ResumeData['projects']>[0], value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const handleTechChange = (index: number, value: string) => {
    const newData = [...data];
    const techs = value.split(',').map(t => t.trim());
    newData[index] = { ...newData[index], technologies: techs };
    onChange(newData);
  };

  const handleAdd = () => {
    onChange([
      ...data,
      { 
        name: 'Project Name', 
        description: 'Project description and key outcomes.',
        technologies: ['React', 'Node.js']
      }
    ]);
  };

  const handleRemove = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>
      
      <div className="space-y-6">
        {data.map((proj, index) => (
          <div key={index} className="relative p-4 bg-gray-50 rounded-md border border-gray-200">
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={proj.technologies?.join(', ') || ''}
                  onChange={(e) => handleTechChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={proj.description}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">
            No projects yet. Click "Add Project" to start.
          </div>
        )}
      </div>
    </div>
  );
}
