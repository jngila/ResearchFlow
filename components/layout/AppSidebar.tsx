'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FlaskConical, LayoutDashboard, FolderOpen, Users, Settings, Bell,
  BarChart3, FileText, BookOpen, GitBranch, Award, MessageSquare,
  Building2, ChevronRight, LogOut, User, Shield, Globe2, Wrench,
  UserCheck, ClipboardList, Calendar, DollarSign, University,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { ROLE_LABELS } from '@/lib/constants';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface NavSection {
  title?: string;
  items: { label: string; href: string; icon: React.ElementType; badge?: number }[];
}

function getRoleNav(role: UserRole, basePath: string): NavSection[] {
  switch (role) {
    case 'student':
      return [
        {
          items: [
            { label: 'Dashboard', href: `${basePath}`, icon: LayoutDashboard },
            { label: 'My Projects', href: `${basePath}/projects`, icon: FolderOpen },
            { label: 'Research Journey', href: `${basePath}/journey`, icon: GitBranch },
            { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
          ],
        },
        {
          title: 'Research Tools',
          items: [
            { label: 'AI Assistant', href: `${basePath}/ai-assistant`, icon: MessageSquare },
            { label: 'Timeline', href: `${basePath}/timeline`, icon: Calendar },
            { label: 'Tasks', href: `${basePath}/tasks`, icon: ClipboardList },
            { label: 'Documents', href: `${basePath}/documents`, icon: FileText },
          ],
        },
        {
          title: 'Supervision',
          items: [
            { label: 'Feedback', href: `${basePath}/feedback`, icon: BookOpen },
            { label: 'Meetings', href: `${basePath}/meetings`, icon: Calendar },
          ],
        },
        {
          title: 'Account',
          items: [
            { label: 'Payments', href: `${basePath}/payments`, icon: DollarSign },
            { label: 'My Profile', href: `${basePath}/profile`, icon: User },
          ],
        },
      ];

    case 'supervisor':
      return [
        {
          items: [
            { label: 'Dashboard', href: `${basePath}`, icon: LayoutDashboard },
            { label: 'My Supervisees', href: `${basePath}/supervisees`, icon: Users },
            { label: 'Projects', href: `${basePath}/projects`, icon: FolderOpen },
            { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
          ],
        },
        {
          title: 'Supervision',
          items: [
            { label: 'Allocation Requests', href: `${basePath}/requests`, icon: UserCheck },
            { label: 'Document Reviews', href: `${basePath}/reviews`, icon: FileText },
            { label: 'Feedback', href: `${basePath}/feedback`, icon: MessageSquare },
            { label: 'Schedule', href: `${basePath}/schedule`, icon: Calendar },
          ],
        },
        {
          title: 'Analysis',
          items: [
            { label: 'Progress Reports', href: `${basePath}/reports`, icon: BarChart3 },
            { label: 'My Profile', href: `${basePath}/profile`, icon: User },
          ],
        },
      ];

    case 'coordinator':
      return [
        {
          items: [
            { label: 'Dashboard', href: `${basePath}`, icon: LayoutDashboard },
            { label: 'All Projects', href: `${basePath}/projects`, icon: FolderOpen },
            { label: 'Users', href: `${basePath}/users`, icon: Users },
            { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
          ],
        },
        {
          title: 'Management',
          items: [
            { label: 'Workflow Engine', href: `${basePath}/workflow`, icon: GitBranch },
            { label: 'Supervisor Allocation', href: `${basePath}/allocation`, icon: UserCheck },
            { label: 'Defenses', href: `${basePath}/defenses`, icon: Award },
            { label: 'Peer Review', href: `${basePath}/peer-review`, icon: ClipboardList },
          ],
        },
        {
          title: 'Reports',
          items: [
            { label: 'Analytics', href: `${basePath}/analytics`, icon: BarChart3 },
            { label: 'Reports', href: `${basePath}/reports`, icon: FileText },
            { label: 'Letters', href: `${basePath}/letters`, icon: BookOpen },
          ],
        },
      ];

    case 'examiner':
      return [
        {
          items: [
            { label: 'Dashboard', href: `${basePath}`, icon: LayoutDashboard },
            { label: 'Assigned Defenses', href: `${basePath}/defenses`, icon: Award },
            { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
          ],
        },
        {
          title: 'Evaluation',
          items: [
            { label: 'Rubrics', href: `${basePath}/rubrics`, icon: ClipboardList },
            { label: 'Outcomes', href: `${basePath}/outcomes`, icon: BarChart3 },
            { label: 'Documents', href: `${basePath}/documents`, icon: FileText },
          ],
        },
      ];

    case 'peer_reviewer':
      return [
        {
          items: [
            { label: 'Dashboard', href: `${basePath}`, icon: LayoutDashboard },
            { label: 'Assigned Reviews', href: `${basePath}/reviews`, icon: ClipboardList },
            { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
          ],
        },
        {
          title: 'Review Work',
          items: [
            { label: 'Completed Reviews', href: `${basePath}/completed`, icon: Award },
            { label: 'Guidelines', href: `${basePath}/guidelines`, icon: BookOpen },
          ],
        },
      ];

    case 'institution_admin':
      return [
        {
          items: [
            { label: 'Dashboard', href: `${basePath}`, icon: LayoutDashboard },
            { label: 'Projects', href: `${basePath}/projects`, icon: FolderOpen },
            { label: 'Users', href: `${basePath}/users`, icon: Users },
            { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
          ],
        },
        {
          title: 'Administration',
          items: [
            { label: 'Institution Settings', href: `${basePath}/institution`, icon: Building2 },
            { label: 'Departments', href: `${basePath}/departments`, icon: GitBranch },
            { label: 'Workflow Config', href: `${basePath}/workflow`, icon: Wrench },
            { label: 'Templates', href: `${basePath}/templates`, icon: FileText },
          ],
        },
        {
          title: 'Analytics',
          items: [
            { label: 'Analytics', href: `${basePath}/analytics`, icon: BarChart3 },
            { label: 'Reports', href: `${basePath}/reports`, icon: ClipboardList },
            { label: 'Audit Log', href: `${basePath}/audit`, icon: Shield },
          ],
        },
      ];

    case 'super_admin':
      return [
        {
          items: [
            { label: 'Dashboard', href: `${basePath}`, icon: LayoutDashboard },
            { label: 'Universities', href: `${basePath}/universities`, icon: University },
            { label: 'Institutions', href: `${basePath}/institutions`, icon: Globe2 },
            { label: 'Users', href: `${basePath}/users`, icon: Users },
            { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
          ],
        },
        {
          title: 'Platform',
          items: [
            { label: 'Pricing & Billing', href: `${basePath}/settings`, icon: DollarSign },
            { label: 'Subscriptions', href: `${basePath}/subscriptions`, icon: Award },
            { label: 'System Monitor', href: `${basePath}/monitor`, icon: BarChart3 },
            { label: 'Audit Logs', href: `${basePath}/audit`, icon: Shield },
          ],
        },
      ];

    default:
      return [{ items: [{ label: 'Dashboard', href: basePath, icon: LayoutDashboard }] }];
  }
}

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-blue-100 text-blue-700',
  supervisor: 'bg-green-100 text-green-700',
  coordinator: 'bg-purple-100 text-purple-700',
  examiner: 'bg-amber-100 text-amber-700',
  peer_reviewer: 'bg-teal-100 text-teal-700',
  institution_admin: 'bg-slate-100 text-slate-700',
  super_admin: 'bg-red-100 text-red-700',
};

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function AppSidebar({ basePath, demoRole }: { basePath: string; demoRole?: UserRole }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const role: UserRole = profile?.role ?? demoRole ?? 'student';
  const name = profile?.full_name ?? 'Demo User';
  const email = 'user@researchflow.io';

  const nav = getRoleNav(role, basePath);

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/');
  }

  const isActive = (href: string) => {
    if (href === basePath) return pathname === basePath;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0B5ED7] rounded-lg flex items-center justify-center shadow-sm">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-slate-900">ResearchFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {nav.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.title && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2 mt-2">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                      isActive(item.href)
                        ? 'bg-[#0B5ED7]/10 text-[#0B5ED7]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <item.icon className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive(item.href) ? 'text-[#0B5ED7]' : 'text-slate-400 group-hover:text-slate-600'
                    )} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="w-5 h-5 bg-[#0B5ED7] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {item.badge}
                      </span>
                    ) : null}
                    {isActive(item.href) && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#0B5ED7] opacity-60" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-[#0B5ED7] text-white text-xs font-semibold">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
            <Badge className={cn('text-xs px-1.5 py-0 h-4 border-0', ROLE_COLORS[role])}>
              {ROLE_LABELS[role]}
            </Badge>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
