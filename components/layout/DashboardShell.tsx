'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';
import { UserRole } from '@/types';

interface DashboardShellProps {
  children: React.ReactNode;
  basePath: string;
  demoRole?: UserRole;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function DashboardShell({
  children,
  basePath,
  demoRole,
  title,
  breadcrumbs,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0">
        <AppSidebar basePath={basePath} demoRole={demoRole} />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 flex flex-col bg-white shadow-xl z-10">
            <AppSidebar basePath={basePath} demoRole={demoRole} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={title}
          breadcrumbs={breadcrumbs}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
