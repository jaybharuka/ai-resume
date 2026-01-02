import React from 'react';
import { OutlineItem } from '@/lib/latex/outlineExtractor';
import { List, Hash } from 'lucide-react';

interface OutlinePanelProps {
  items: OutlineItem[];
  onItemClick: (lineNumber: number) => void;
}

export default function OutlinePanel({ items, onItemClick }: OutlinePanelProps) {
  const renderItems = (nodes: OutlineItem[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#161b22] cursor-pointer text-sm transition-colors group"
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
          onClick={() => onItemClick(node.lineNumber)}
        >
          <span className={`shrink-0 ${
            node.type === 'section' ? 'text-blue-400' : 
            node.type === 'subsection' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Hash size={12} />
          </span>
          <span className={`truncate ${
            node.type === 'section' ? 'text-gray-200 font-medium' : 'text-gray-400'
          } group-hover:text-white transition-colors`}>
            {node.title}
          </span>
        </div>
        {node.children.length > 0 && (
          <div>{renderItems(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-gray-300 border-t border-white/10">
      <div className="p-3 border-b border-white/10 flex items-center gap-2">
        <List size={14} className="text-gray-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Outline</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {items.length === 0 ? (
          <div className="p-4 text-xs text-gray-500 text-center italic">
            No sections found. Use \section&#123;...&#125; to create an outline.
          </div>
        ) : (
          renderItems(items)
        )}
      </div>
    </div>
  );
}
