import React, { useEffect, useState } from 'react';
import { FileText, MoreVertical, Edit, Trash2, Plus } from 'lucide-react';
import { getUserResumes } from '@/lib/actions/resume';
import { useUser } from '@clerk/nextjs';

interface ResumeSummary {
  id: string;
  filename: string;
  updatedAt: string;
  atsScore: number;
  thumbnail?: string;
}

interface DashboardProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export default function Dashboard({ onEdit, onCreate }: DashboardProps) {
  const { user } = useUser();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const data = await getUserResumes();
        const formatted = data.map((r: any) => ({
            id: r.id,
            filename: r.title,
            updatedAt: new Date(r.updatedAt).toLocaleDateString(),
            atsScore: r.atsScore || 0,
        }));
        setResumes(formatted);
      } catch (error) {
        console.error("Failed to fetch resumes", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResumes();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back, {user?.firstName || 'User'}</p>
            </div>
            <button 
                onClick={onCreate}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
                <Plus size={18} /> New Resume
            </button>
        </div>
        
        {/* Recent Resumes Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Resumes</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
          </div>
          
          {isLoading ? (
             <div className="flex items-center justify-center h-64 text-slate-400">Loading resumes...</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                {/* Thumbnail Preview */}
                <div className="h-40 bg-slate-100 relative border-b border-slate-100 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => onEdit(resume.id)}>
                   {/* Placeholder for PDF Preview */}
                   <div className="w-24 h-32 bg-white shadow-sm border border-slate-200 transform group-hover:scale-105 transition-transform duration-300 flex flex-col p-1.5 gap-1">
                      <div className="w-full h-1.5 bg-slate-100 rounded-sm"></div>
                      <div className="w-3/4 h-1.5 bg-slate-100 rounded-sm"></div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-sm mt-1"></div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-sm"></div>
                      <div className="w-5/6 h-1.5 bg-slate-100 rounded-sm"></div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-sm mt-1"></div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-sm"></div>
                   </div>
                   
                   {/* ATS Badge */}
                   <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border ${
                      resume.atsScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      resume.atsScore >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                   }`}>
                      {resume.atsScore}/100
                   </div>
                </div>
  
                {/* Card Content */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm truncate cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => onEdit(resume.id)} title={resume.filename}>
                              {resume.filename}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">Edited {resume.updatedAt}</p>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded">
                          <MoreVertical size={14} />
                      </button>
                  </div>
  
                  <button 
                      onClick={() => onEdit(resume.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                      <Edit size={12} /> Edit Resume
                  </button>
                </div>
              </div>
            ))}
            
            {/* New Resume Card (Inline) */}
             <button onClick={onCreate} className="group flex flex-col items-center justify-center h-full min-h-[260px] border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all shadow-sm">
                      <Plus size={20} />
                  </div>
                  <span className="font-medium text-slate-500 text-sm group-hover:text-indigo-600">Create New</span>
             </button>
          </div>
          )}
        </section>
      </div>
    </div>
  );
}
