'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ResearchProject } from '@/types';
import { Users, FolderOpen, Clock, CheckCircle, ArrowRight, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SupervisorDashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const { data: projData } = await supabase
        .from('research_projects')
        .select('*')
        .eq('supervisor_id', profile!.id)
        .order('created_at', { ascending: false });

      const projs = (projData ?? []) as ResearchProject[];
      setProjects(projs);

      if (projs.length > 0) {
        const studentIds = Array.from(new Set(projs.map(p => p.student_id)));
        const { data: students } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', studentIds);
        const map: Record<string, string> = {};
        (students ?? []).forEach((s: any) => { map[s.id] = s.full_name; });
        setStudentNames(map);
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  const pending = projects.filter(p => p.status === 'submitted' || p.status === 'under_review').length;
  const completed = projects.filter(p => p.status === 'completed').length;

  return (
    <DashboardShell
      basePath="/dashboard/supervisor"
      demoRole="supervisor"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#198754] to-[#1da562] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-100 text-sm mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold mb-1">{profile?.full_name ?? '—'}</h1>
            <p className="text-green-200 text-sm">
              Supervisor{profile?.department ? ` \u2022 ${profile.department}` : ''}
            </p>
            {profile?.researchflow_id && (
              <div className="flex items-center gap-1.5 mt-2 bg-white/10 rounded-lg px-3 py-1.5 w-fit">
                <Hash className="w-3.5 h-3.5 text-green-200" />
                <span className="text-xs font-mono text-green-100 tracking-wide">{profile.researchflow_id}</span>
              </div>
            )}
          </div>
          <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
            <p className="text-3xl font-bold">{loading ? '—' : projects.length}</p>
            <p className="text-green-100 text-xs mt-0.5">Active supervisees</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Supervisees" value={loading ? '—' : projects.length} icon={Users} color="green" />
        <StatCard label="Active Projects" value={loading ? '—' : projects.length - completed} icon={FolderOpen} color="blue" />
        <StatCard label="Pending Reviews" value={loading ? '—' : pending} icon={Clock} color="amber" delta={pending > 0 ? 'Needs action' : undefined} deltaType="negative" />
        <StatCard label="Completed" value={loading ? '—' : completed} icon={CheckCircle} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Supervised Projects</h2>
            <Link href="/dashboard/supervisor/projects">
              <Button variant="ghost" size="sm" className="text-[#198754] h-8 gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm">No students assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  href={`/dashboard/supervisor/projects/${p.id}`}
                  showStudent
                  studentName={studentNames[p.student_id] ?? '—'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Pending Reviews</h3>
              {pending > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">{pending} pending</Badge>
              )}
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : projects.filter(p => p.status === 'submitted' || p.status === 'under_review').length === 0 ? (
              <p className="text-xs text-slate-400">No pending reviews.</p>
            ) : (
              <div className="space-y-3">
                {projects.filter(p => p.status === 'submitted' || p.status === 'under_review').slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-[#0B5ED7]/10 rounded-full flex items-center justify-center text-[#0B5ED7] text-xs font-bold shrink-0">
                      {(studentNames[p.student_id] ?? '?').split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{studentNames[p.student_id] ?? '—'}</p>
                      <p className="text-xs text-slate-400 truncate">{p.title}</p>
                      <Badge className="mt-1 bg-blue-50 text-blue-600 border-0 text-xs">{p.status.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
