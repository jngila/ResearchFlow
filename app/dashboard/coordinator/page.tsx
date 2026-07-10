'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ResearchProject } from '@/types';
import { STAGE_LABELS, STATUS_COLORS } from '@/lib/constants';
import { FolderOpen, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function CoordinatorDashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [supervisors, setSupervisors] = useState<{ id: string; full_name: string }[]>([]);
  const [supervisorLoads, setSupervisorLoads] = useState<{ id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.institution_id) return;
    async function load() {
      const instId = profile!.institution_id;
      const [projRes, supRes] = await Promise.all([
        supabase.from('research_projects').select('*').eq('institution_id', instId).order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name').eq('institution_id', instId).eq('role', 'supervisor'),
      ]);

      const projs = (projRes.data ?? []) as ResearchProject[];
      setProjects(projs);

      const sups = supRes.data ?? [];
      setSupervisors(sups);

      const loads = sups.map((s: any) => ({
        id: s.id,
        count: projs.filter(p => p.supervisor_id === s.id).length,
      }));
      setSupervisorLoads(loads);
      setLoading(false);
    }
    load();
  }, [profile]);

  const pending = projects.filter(p => p.status === 'under_review' || p.status === 'submitted').length;
  const completed = projects.filter(p => p.status === 'completed').length;

  // Build stage distribution for chart
  const stageMap: Record<string, number> = {};
  projects.forEach(p => { stageMap[p.current_stage] = (stageMap[p.current_stage] ?? 0) + 1; });
  const stageData = Object.entries(stageMap).map(([stage, count]) => ({
    stage: (STAGE_LABELS as Record<string, string>)[stage]?.slice(0, 8) ?? stage,
    count,
  }));

  return (
    <DashboardShell
      basePath="/dashboard/coordinator"
      demoRole="coordinator"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-300 text-sm mb-1">Research Coordinator</p>
            <h1 className="text-2xl font-bold mb-1">{profile?.full_name ?? '—'}</h1>
            <p className="text-slate-400 text-sm">{profile?.department ?? 'Graduate Studies'}</p>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'Total Projects', value: loading ? '—' : projects.length },
              { label: 'Supervisors', value: loading ? '—' : supervisors.length },
              { label: 'Pending Approval', value: loading ? '—' : pending },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-slate-300 text-xs mt-0.5 whitespace-nowrap">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="All Projects" value={loading ? '—' : projects.length} icon={FolderOpen} color="blue" />
        <StatCard label="Pending Approval" value={loading ? '—' : pending} icon={Clock} color="amber" delta={pending > 0 ? 'Needs review' : undefined} deltaType="negative" />
        <StatCard label="Completed" value={loading ? '—' : completed} icon={CheckCircle} color="green" />
        <StatCard label="Overdue" value={0} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects by stage chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Projects by Stage</h2>
            <Badge className="bg-blue-50 text-[#0B5ED7] border-0 text-xs">Current cohort</Badge>
          </div>
          {loading ? <Skeleton className="h-48 rounded" /> : stageData.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-16">No projects yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="count" fill="#0B5ED7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions + supervisor workload */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'View All Projects', href: '/dashboard/coordinator/projects', color: 'bg-blue-50 text-[#0B5ED7]' },
                { label: 'View Analytics', href: '/dashboard/coordinator/analytics', color: 'bg-green-50 text-[#198754]' },
              ].map(action => (
                <Link key={action.label} href={action.href}>
                  <div className={cn('flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity', action.color)}>
                    <span className="text-sm font-medium">{action.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-60" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {supervisors.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Supervisor Workload</h3>
              <div className="space-y-3">
                {supervisors.slice(0, 5).map(s => {
                  const load = supervisorLoads.find(l => l.id === s.id)?.count ?? 0;
                  const max = 8;
                  return (
                    <div key={s.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600 truncate max-w-[140px]">{s.full_name}</span>
                        <span className="text-xs text-slate-400">{load}/{max}</span>
                      </div>
                      <ProgressBar value={(load / max) * 100} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects table */}
      <div className="mt-6 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">Recent Projects</h2>
          <Link href="/dashboard/coordinator/projects">
            <Button variant="ghost" size="sm" className="text-[#0B5ED7] h-8 gap-1 text-xs">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-50">
                  <th className="px-5 py-3">Project Title</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projects.slice(0, 8).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800 truncate max-w-xs">{p.title}</p>
                      <p className="text-xs text-slate-400">{p.program}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {STAGE_LABELS[p.current_stage]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={cn('text-xs border-0 whitespace-nowrap', STATUS_COLORS[p.status])}>
                        {p.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress_percentage} className="h-1.5 w-16" />
                        <span className="text-xs text-slate-500">{p.progress_percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
