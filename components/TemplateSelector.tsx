import React from 'react';
import { templates, TemplateName } from './templates';
import { X, Check } from 'lucide-react';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: TemplateName;
  onSelect: (template: TemplateName) => void;
}

export default function TemplateSelector({ isOpen, onClose, currentTemplate, onSelect }: TemplateSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-gray-500 text-sm mt-1">Select a design that fits your style. You can change this anytime.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-gray-50/50">
          {(Object.keys(templates) as TemplateName[]).map((name) => (
            <button
              key={name}
              onClick={() => { onSelect(name); onClose(); }}
              className={`group relative aspect-[210/297] rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl bg-white ${
                currentTemplate === name 
                  ? 'ring-4 ring-blue-500 ring-offset-4 scale-[1.02]' 
                  : 'hover:scale-[1.02] hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              }`}
            >
              {/* Preview Placeholder */}
              <div className="absolute inset-0 p-3 flex flex-col">
                <div className={`w-full h-full rounded border border-gray-100 overflow-hidden relative ${
                  name === 'glitch' ? 'bg-white' : 
                  name === 'tech' ? 'bg-[#1e1e1e]' : 
                  name === 'startup' ? 'bg-gray-50' : 'bg-white'
                }`}>
                  {/* Mini Layout Representation */}
                  <div className="w-full h-full opacity-50 pointer-events-none transform scale-50 origin-top-left w-[200%] h-[200%] p-8">
                     {/* Abstract representation of the template style */}
                     <div className="flex flex-col gap-4">
                        <div className={`h-8 w-1/2 rounded ${name === 'modern' ? 'bg-slate-800' : 'bg-gray-300'}`}></div>
                        <div className="flex gap-4">
                           <div className={`w-1/3 h-64 rounded ${name === 'modern' ? 'bg-slate-800' : 'bg-gray-100'}`}></div>
                           <div className="w-2/3 space-y-2">
                              <div className="h-4 w-full bg-gray-200 rounded"></div>
                              <div className="h-4 w-full bg-gray-200 rounded"></div>
                              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Overlay Label */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 flex justify-between items-end">
                <span className="text-white font-bold capitalize text-lg tracking-wide">{name}</span>
                {currentTemplate === name && (
                  <span className="bg-blue-500 text-white p-1 rounded-full">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
