'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import WorkflowTracker from '@/components/dashboard/WorkflowTracker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ResearchProject, Notification } from '@/types';
import { FolderOpen, Clock, CheckCircle, AlertTriangle, ArrowRight, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      supabase
        .from('research_projects')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]).then(([projRes, notifRes]) => {
      if (projRes.data) setProjects(projRes.data as ResearchProject[]);
      if (notifRes.data) setNotifications(notifRes.data as Notification[]);
      setLoading(false);
    });
  }, [profile]);

  const activeProject = projects[0];
  const unread = notifications.filter(n => !n.is_read).length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const inProgress = projects.filter(p => p.status === 'in_progress' || p.status === 'submitted' || p.status === 'under_review').length;

  return (
    <DashboardShell
      basePath="/dashboard/student"
      demoRole="student"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#0B5ED7] to-[#1e6fe8] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Good morning</p>
            <h1 className="text-2xl font-bold mb-1">{profile?.full_name ?? '—'}</h1>
            <p className="text-blue-200 text-sm">
              {profile?.programme ? `${profile.programme} \u2022 ` : ''}
              {profile?.school_faculty ?? profile?.department ?? ''}
            </p>
            {profile?.researchflow_id && (
              <div className="flex items-center gap-1.5 mt-2 bg-white/10 rounded-lg px-3 py-1.5 w-fit">
                <Hash className="w-3.5 h-3.5 text-blue-200" />
                <span className="text-xs font-mono text-blue-100 tracking-wide">{profile.researchflow_id}</span>
              </div>
            )}
          </div>
          {activeProject?.expected_completion && (
            <div className="text-right">
              <p className="text-blue-100 text-xs mb-1">Active project deadline</p>
              <p className="text-white font-semibold text-lg">
                {new Date(activeProject.expected_completion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Projects" value={loading ? '—' : projects.length} icon={FolderOpen} color="blue" />
        <StatCard label="In Progress" value={loading ? '—' : inProgress} icon={Clock} color="amber" />
        <StatCard label="Completed" value={loading ? '—' : completed} icon={CheckCircle} color="green" />
        <StatCard label="Notifications" value={loading ? '—' : unread} icon={AlertTriangle} color={unread > 0 ? 'red' : 'blue'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">My Research Projects</h2>
            <Link href="/dashboard/student/projects">
              <Button variant="ghost" size="sm" className="text-[#0B5ED7] h-8 gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No projects yet. Register your first research project.</p>
              <Link href="/dashboard/student/projects">
                <Button size="sm" className="mt-4 bg-[#0B5ED7] hover:bg-[#0a52c4]">Get started</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 3).map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  href={`/dashboard/student/projects/${p.id}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {activeProject && (
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Active Project Progress</h3>
              <p className="text-xs text-slate-500 mb-4 truncate">{activeProject.title}</p>
              <WorkflowTracker currentStage={activeProject.current_stage} status={activeProject.status} />
            </div>
          )}

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
              {unread > 0 && (
                <Badge className="bg-[#0B5ED7] text-white text-xs h-5 px-2">{unread} new</Badge>
              )}
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded" />)}</div>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-slate-400">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map(n => (
                  <div key={n.id} className="flex gap-2.5">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 shrink-0',
                      n.is_read ? 'bg-slate-200' : 'bg-[#0B5ED7]'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs', n.is_read ? 'text-slate-400' : 'font-medium text-slate-700')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
        </div>
        <ActivityFeed activities={[]} maxItems={5} />
      </div>
    </DashboardShell>
  );
}
