import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIAssistButtonProps {
  position: { top: number; left: number } | null;
  onClick: () => void;
}

export default function AIAssistButton({ position, onClick }: AIAssistButtonProps) {
  if (!position) return null;

  return (
    <button
      onClick={onClick}
      style={{
        top: position.top,
        left: position.left,
        position: 'absolute',
        zIndex: 50,
      }}
      className="p-1.5 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 hover:scale-110 transition-all duration-200 animate-in fade-in zoom-in"
      title="AI Assist"
    >
      <Sparkles className="w-4 h-4" />
    </button>
  );
}
