'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Settings, Home, FileCode, ChevronLeft, Menu, PlusCircle } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import { useUIStore } from '@/lib/stores/uiStore';

export default function Sidebar() {
  const { activeTab, setActiveTab, isSidebarCollapsed, toggleSidebar, tourStep } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'editor', icon: FileText, label: 'Editor' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id as any);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <div 
      className={`${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      } bg-slate-900 text-white h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50`}
    >
      <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isSidebarCollapsed && (
          <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap overflow-hidden">
            Resumex
          </h1>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 space-y-2 mt-4">
        {/* Dashboard */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative ${
            activeTab === 'dashboard' && pathname === '/'
              ? 'bg-slate-800 text-white' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          title={isSidebarCollapsed ? 'Dashboard' : undefined}
        >
          <Home size={20} className={`transition-colors shrink-0 ${activeTab === 'dashboard' && pathname === '/' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} />
          {!isSidebarCollapsed && <span>Dashboard</span>}
          {activeTab === 'dashboard' && pathname === '/' && !isSidebarCollapsed && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
          )}
        </button>

        {/* Create Resume - right after Dashboard */}
        <Link
          href="/create-resume"
          className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative ${
            pathname === '/create-resume'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          title={isSidebarCollapsed ? "Create Resume" : undefined}
        >
          <PlusCircle size={20} className={`transition-colors shrink-0 ${pathname === '/create-resume' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} />
          {!isSidebarCollapsed && <span>Create Resume</span>}
          {pathname === '/create-resume' && !isSidebarCollapsed && (
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
          )}
        </Link>

        <div className="my-2 border-t border-slate-800 mx-2"></div>

        {/* Editor */}
        <button
          onClick={() => handleTabClick('editor')}
          className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative ${
            activeTab === 'editor' && pathname === '/'
              ? 'bg-slate-800 text-white' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          title={isSidebarCollapsed ? 'Editor' : undefined}
        >
          <FileText size={20} className={`transition-colors shrink-0 ${activeTab === 'editor' && pathname === '/' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} />
          {!isSidebarCollapsed && <span>Editor</span>}
          {activeTab === 'editor' && pathname === '/' && !isSidebarCollapsed && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
          )}
        </button>

        {/* Settings - Link to /settings page */}
        <Link
          href="/settings"
          className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative ${
            pathname === '/settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          title={isSidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings size={20} className={`transition-colors shrink-0 ${pathname === '/settings' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} />
          {!isSidebarCollapsed && <span>Settings</span>}
          {pathname === '/settings' && !isSidebarCollapsed && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
          )}
        </Link>

        <div className="my-2 border-t border-slate-800 mx-2"></div>

        {/* LaTeX Pro link with tour highlight */}
        <div className="relative">
          <Link
            href="/latex"
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative ${
              pathname === '/latex'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${isSidebarCollapsed ? 'justify-center' : ''} ${tourStep === 2 || tourStep === 3 ? 'bg-indigo-700 text-white ring-2 ring-indigo-400' : ''}`}
            title={isSidebarCollapsed ? "LaTeX Pro" : undefined}
          >
            <FileCode size={20} className={`transition-colors shrink-0 ${pathname === '/latex' || tourStep === 2 || tourStep === 3 ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} />
            {!isSidebarCollapsed && <span>LaTeX Pro</span>}
            {pathname === '/latex' && !isSidebarCollapsed && (
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
            )}
          </Link>
        </div>
      </nav>

      <div className={`p-4 border-t border-slate-800 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
        <UserButton afterSignOutUrl="/" />
        {!isSidebarCollapsed && <span className="text-sm text-slate-400">Profile</span>}
      </div>
    </div>
  );
}
