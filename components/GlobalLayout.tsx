'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto h-screen">
        {children}
      </main>
    </div>
  );
}
