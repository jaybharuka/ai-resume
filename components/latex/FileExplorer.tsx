import React from 'react';
import { FolderOpen, FileText, Image as ImageIcon, FileCode, ChevronRight, ChevronDown, Plus } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
}

// Mock data - in a real app this would come from the file system or store
const initialFiles: FileNode[] = [
  {
    id: 'root',
    name: 'Project',
    type: 'folder',
    isOpen: true,
    children: [
      { id: 'main', name: 'resume.tex', type: 'file' },
      { id: 'cls', name: 'resume.cls', type: 'file' },
      { 
        id: 'assets', 
        name: 'assets', 
        type: 'folder', 
        isOpen: false,
        children: [
          { id: 'photo', name: 'profile.jpg', type: 'file' }
        ] 
      }
    ]
  }
];

export default function FileExplorer() {
  const [files, setFiles] = React.useState(initialFiles);

  const toggleFolder = (id: string) => {
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };
    setFiles(toggleNode(files));
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          className={`flex items-center gap-1.5 py-1 px-2 hover:bg-[#161b22] cursor-pointer text-sm transition-colors ${node.name === 'resume.tex' ? 'bg-[#161b22] text-blue-400' : 'text-gray-400'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => node.type === 'folder' && toggleFolder(node.id)}
        >
          {node.type === 'folder' && (
            <span className="text-gray-500">
              {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {node.type === 'folder' ? (
            <FolderOpen size={14} className="text-amber-500" />
          ) : node.name.endsWith('.tex') || node.name.endsWith('.cls') ? (
            <FileCode size={14} className="text-blue-400" />
          ) : (
            <ImageIcon size={14} className="text-purple-400" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-gray-300">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Files</span>
        <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {renderTree(files)}
      </div>
    </div>
  );
}
