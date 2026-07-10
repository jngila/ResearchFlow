'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, FolderOpen, Building2, Settings, BarChart3,
  CheckCircle, AlertTriangle, ArrowRight, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PIE_COLORS = ['#0B5ED7', '#198754', '#FFC107', '#ef4444'];

export default function InstitutionAdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, projects: 0, completed: 0, overdue: 0 });
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [stageCounts, setStageCounts] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.institution_id) return;
    async function load() {
      const instId = profile!.institution_id;
      const [usersRes, projectsRes] = await Promise.all([
        supabase.from('profiles').select('id, role').eq('institution_id', instId),
        supabase.from('research_projects').select('id, status').eq('institution_id', instId),
      ]);

      const users = usersRes.data ?? [];
      const projects = projectsRes.data ?? [];

      const rc: Record<string, number> = {};
      users.forEach((u: any) => { rc[u.role] = (rc[u.role] ?? 0) + 1; });
      setRoleCounts(rc);

      const completed = projects.filter((p: any) => p.status === 'completed').length;
      const inProgress = projects.filter((p: any) => ['in_progress', 'submitted'].includes(p.status)).length;
      const underReview = projects.filter((p: any) => p.status === 'under_review').length;

      setStats({ users: users.length, projects: projects.length, completed, overdue: 0 });
      setStageCounts([
        { name: 'In Progress', value: inProgress, color: PIE_COLORS[0] },
        { name: 'Completed', value: completed, color: PIE_COLORS[1] },
        { name: 'Under Review', value: underReview, color: PIE_COLORS[2] },
        { name: 'Other', value: Math.max(0, projects.length - inProgress - completed - underReview), color: PIE_COLORS[3] },
      ].filter(s => s.value > 0));

      setLoading(false);
    }
    load();
  }, [profile]);

  const roleBreakdown = [
    { role: 'Students', key: 'student', color: 'bg-[#0B5ED7]' },
    { role: 'Supervisors', key: 'supervisor', color: 'bg-[#198754]' },
    { role: 'Coordinators', key: 'coordinator', color: 'bg-purple-500' },
    { role: 'Examiners', key: 'examiner', color: 'bg-amber-500' },
    { role: 'Peer Reviewers', key: 'peer_reviewer', color: 'bg-teal-500' },
  ];

  return (
    <DashboardShell
      basePath="/dashboard/admin"
      demoRole="institution_admin"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">Institution Admin</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-1">{profile?.full_name ?? '—'}</h1>
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {profile?.department ?? 'Your Institution'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/admin/institution">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 h-9">
                <Settings className="w-4 h-4 mr-1.5" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={loading ? '—' : stats.users} icon={Users} color="blue" />
        <StatCard label="Active Projects" value={loading ? '—' : stats.projects} icon={FolderOpen} color="green" />
        <StatCard label="Completed" value={loading ? '—' : stats.completed} icon={CheckCircle} color="purple" />
        <StatCard label="Overdue" value={loading ? '—' : stats.overdue} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project distribution */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Project Distribution</h2>
          {loading ? <Skeleton className="h-48 rounded" /> : stageCounts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No projects yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stageCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {stageCounts.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Users by role */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Users by Role</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-6 rounded" />)}</div>
          ) : (
            <div className="space-y-3">
              {roleBreakdown.map(item => {
                const count = roleCounts[item.key] ?? 0;
                return (
                  <div key={item.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{item.role}</span>
                      <span className="font-medium text-slate-800">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', item.color)}
                        style={{ width: stats.users > 0 ? `${(count / stats.users) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick admin actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Administration</h3>
            <div className="space-y-2">
              {[
                { label: 'Manage Users', href: '/dashboard/admin/users', icon: Users, color: 'text-[#0B5ED7]' },
                { label: 'Institution Settings', href: '/dashboard/admin/institution', icon: Settings, color: 'text-purple-600' },
                { label: 'View Projects', href: '/dashboard/coordinator/projects', icon: FolderOpen, color: 'text-[#198754]' },
                { label: 'View Audit Log', href: '/dashboard/admin/audit', icon: Shield, color: 'text-amber-600' },
              ].map(action => (
                <Link key={action.label} href={action.href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                    <action.icon className={cn('w-4 h-4 shrink-0', action.color)} />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{action.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
