import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface SectionBlockProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onDelete?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function SectionBlock({ 
  id, 
  title, 
  children, 
  onDelete,
  isExpanded = true,
  onToggleExpand
}: SectionBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button 
            {...attributes} 
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {onToggleExpand && (
            <button 
              onClick={onToggleExpand}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}
