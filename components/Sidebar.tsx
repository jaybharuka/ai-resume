import React from 'react';
import { FileText, Layout, Settings, Home, LogOut } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'editor', icon: FileText, label: 'Editor' },
    { id: 'templates', icon: Layout, label: 'Templates' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen sticky top-0 flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-white">AI Resume</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-slate-800 text-white border-l-4 border-indigo-500' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-slate-400">Profile</span>
        </div>
      </div>
    </div>
  );
}
