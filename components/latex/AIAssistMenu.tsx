import React from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';

interface AIAssistMenuProps {
  position: { top: number; left: number } | null;
  onAction: (action: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const actions = [
  { id: "improve", label: "Improve Bullet" },
  { id: "rewrite-pro", label: "Rewrite Professionally" },
  { id: "add-metrics", label: "Add Metrics" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
  { id: "grammar", label: "Fix Grammar" }
];

export default function AIAssistMenu({ position, onAction, onClose, isLoading }: AIAssistMenuProps) {
  if (!position) return null;

  return (
    <div
      style={{
        top: position.top,
        left: position.left,
        position: 'absolute',
        zIndex: 50,
      }}
      className="bg-[#111827] border border-gray-700 rounded-xl shadow-xl p-2 w-64 animate-in fade-in zoom-in duration-200"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 mb-1">
        <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini AI Assist</span>
        </div>
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
      </div>
      
      <div className="flex flex-col gap-1">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={isLoading}
            className="text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1f2937] hover:text-white rounded-lg transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
