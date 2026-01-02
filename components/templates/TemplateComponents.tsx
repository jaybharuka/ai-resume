import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface EditableProps {
  value: string | undefined | null;
  onChange: (val: string) => void;
  className?: string;
  tagName?: any;
  placeholder?: string;
  style?: React.CSSProperties;
  isEditing: boolean;
}

export const Editable = ({ 
  value, 
  onChange, 
  className = "", 
  tagName: Tag = "span",
  placeholder = "...",
  style = {},
  isEditing
}: EditableProps) => {
  if (!isEditing) return <Tag className={className} style={style}>{value}</Tag>;

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: React.FocusEvent<HTMLElement>) => onChange(e.currentTarget.innerText)}
      className={`outline-none hover:ring-1 hover:ring-blue-300 focus:ring-1 focus:ring-blue-500 rounded px-0.5 -mx-0.5 transition-all empty:before:content-['${placeholder}'] empty:before:text-gray-400 cursor-text ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  );
};

export const AddButton = ({ onClick, label, className = "", isEditing }: { onClick: () => void, label: string, className?: string, isEditing: boolean }) => {
  if (!isEditing) return null;
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors mt-2 print:hidden ${className}`}
    >
      <Plus size={12} /> {label}
    </button>
  );
};

export const RemoveButton = ({ onClick, className = "", isEditing }: { onClick: () => void, className?: string, isEditing: boolean }) => {
  if (!isEditing) return null;
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`absolute -right-6 top-0 text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden ${className}`}
      title="Remove item"
    >
      <Trash2 size={14} />
    </button>
  );
};

export const SectionControls = ({ onDelete, className = "", isEditing }: { onDelete: () => void, className?: string, isEditing: boolean }) => {
  if (!isEditing) return null;
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className={`opacity-0 group-hover/section:opacity-100 transition-opacity text-slate-400 hover:text-red-500 print:hidden ${className}`}
      title="Remove Section"
    >
      <Trash2 size={14} />
    </button>
  );
};

export const AddSectionButton = ({ onClick, label, className = "", isEditing }: { onClick: () => void, label: string, className?: string, isEditing: boolean }) => {
  if (!isEditing) return null;
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-blue-600 border border-dashed border-slate-300 hover:border-blue-400 rounded px-3 py-2 w-full justify-center transition-all mt-2 print:hidden ${className}`}
    >
      <Plus size={14} /> Add {label}
    </button>
  );
};

export const CustomSectionRenderer = ({ 
  section, 
  index, 
  onUpdate, 
  onDelete, 
  colorAccent,
  isEditing,
  className = "mb-6",
  headerClassName = "mb-2 border-b pb-1",
  titleClassName = "text-lg font-bold uppercase tracking-wider"
}: { 
  section: NonNullable<ResumeData['customSections']>[0], 
  index: number, 
  onUpdate: (newSection: any) => void, 
  onDelete: () => void,
  colorAccent?: string,
  isEditing: boolean,
  className?: string,
  headerClassName?: string,
  titleClassName?: string
}) => {
  // Type for detailed items
  type DetailedItem = { name?: string; description?: string; date?: string; bullets?: string[] };
  
  // Items array might contain a mix of strings and objects due to data extraction
  // Cast to any[] to handle mixed types at runtime
  const rawItems: any[] = (section.items as any[]) || [];
  const simpleItems: string[] = rawItems.filter((item): item is string => typeof item === 'string');
  const objectItemsFromItems: DetailedItem[] = rawItems.filter((item): boolean => typeof item === 'object' && item !== null) as DetailedItem[];
  
  // Combine detailedItems with any objects found in items array
  const detailedItems: DetailedItem[] = [...(section.detailedItems || []), ...objectItemsFromItems];
  
  return (
    <div className={`break-inside-avoid group/section ${className}`}>
      <div className={`flex items-center justify-between ${headerClassName}`} style={{ borderColor: colorAccent }}>
        <Editable 
          tagName="h2" 
          className={titleClassName}
          style={{ color: colorAccent }}
          value={section.title} 
          onChange={(val) => onUpdate({ ...section, title: val })} 
          isEditing={isEditing}
        />
        <SectionControls onDelete={onDelete} isEditing={isEditing} />
      </div>
      
      {/* Paragraph content */}
      {section.content && (
        <Editable 
          tagName="p" 
          className="text-gray-700 text-sm mb-2" 
          value={section.content} 
          onChange={(val) => onUpdate({ ...section, content: val })} 
          isEditing={isEditing}
        />
      )}
      
      {/* Simple string items as bullet list */}
      {simpleItems.length > 0 && (
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 text-sm">
          {simpleItems.map((item, i) => (
            <li key={i} className="pl-1 relative group/item">
              <Editable value={item} onChange={(val) => {
                const newItems = [...simpleItems];
                newItems[i] = val;
                onUpdate({ ...section, items: newItems });
              }} isEditing={isEditing} />
              {isEditing && (
                <button 
                  onClick={() => {
                    const newItems = [...simpleItems];
                    newItems.splice(i, 1);
                    onUpdate({ ...section, items: newItems });
                  }}
                  className="absolute -left-5 top-0 text-red-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100"
                >
                  <X size={10} />
                </button>
              )}
            </li>
          ))}
          <AddButton onClick={() => {
            const newItems = [...simpleItems, "New item"];
            onUpdate({ ...section, items: newItems });
          }} label="Add Item" isEditing={isEditing} />
        </ul>
      )}
      
      {/* Detailed items (legacy format) */}
      {detailedItems.length > 0 && (
        <div className="space-y-4">
          {detailedItems.map((item, i) => (
            <div key={i} className="relative group">
              <div className="flex justify-between items-baseline">
                <Editable tagName="h3" className="font-bold text-md" value={item.name} onChange={(val) => {
                  const newItems = [...detailedItems];
                  newItems[i] = { ...item, name: val };
                  onUpdate({ ...section, detailedItems: newItems });
                }} isEditing={isEditing} />
                <Editable className="text-sm text-gray-500" value={item.date} onChange={(val) => {
                  const newItems = [...detailedItems];
                  newItems[i] = { ...item, date: val };
                  onUpdate({ ...section, detailedItems: newItems });
                }} isEditing={isEditing} />
              </div>
              <Editable tagName="p" className="text-gray-700 text-sm" value={item.description} onChange={(val) => {
                  const newItems = [...detailedItems];
                  newItems[i] = { ...item, description: val };
                  onUpdate({ ...section, detailedItems: newItems });
              }} isEditing={isEditing} />
              
              {item.bullets && item.bullets.length > 0 && (
                 <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 text-sm mt-1">
                   {item.bullets.map((bullet: string, j: number) => (
                     <li key={j} className="pl-1 relative group/bullet">
                       <Editable value={bullet} onChange={(val) => {
                          const newItems = [...detailedItems];
                          const newBullets = [...(item.bullets || [])];
                          newBullets[j] = val;
                          newItems[i] = { ...item, bullets: newBullets };
                          onUpdate({ ...section, detailedItems: newItems });
                       }} isEditing={isEditing} />
                       {isEditing && (
                          <button 
                            onClick={() => {
                              const newItems = [...detailedItems];
                              const newBullets = [...(item.bullets || [])];
                              newBullets.splice(j, 1);
                              newItems[i] = { ...item, bullets: newBullets };
                              onUpdate({ ...section, detailedItems: newItems });
                            }}
                            className="absolute -left-5 top-0 text-red-300 hover:text-red-500 opacity-0 group-hover/bullet:opacity-100"
                          >
                            <X size={10} />
                          </button>
                       )}
                     </li>
                   ))}
                   <AddButton onClick={() => {
                      const newItems = [...detailedItems];
                      const newBullets = [...(item.bullets || [])];
                      newBullets.push("New bullet");
                      newItems[i] = { ...item, bullets: newBullets };
                      onUpdate({ ...section, detailedItems: newItems });
                   }} label="Add Bullet" isEditing={isEditing} />
                 </ul>
              )}
              <RemoveButton onClick={() => {
                  const newItems = [...detailedItems];
                  newItems.splice(i, 1);
                  onUpdate({ ...section, detailedItems: newItems });
              }} isEditing={isEditing} />
            </div>
          ))}
          <AddButton onClick={() => {
              const newItems = [...detailedItems, { name: "New Item", description: "Description", date: "Date", bullets: [] }];
              onUpdate({ ...section, detailedItems: newItems });
          }} label="Add Item" isEditing={isEditing} />
        </div>
      )}
      
      {/* Show add button if no items at all */}
      {simpleItems.length === 0 && detailedItems.length === 0 && (
        <AddButton onClick={() => {
          onUpdate({ ...section, items: ["New item"] });
        }} label="Add Item" isEditing={isEditing} />
      )}
    </div>
  );
};
