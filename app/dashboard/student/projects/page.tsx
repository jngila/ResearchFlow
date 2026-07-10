'use client';

import { useEffect, useState } from 'react';
import { useState as useLocalState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import WorkflowTracker from '@/components/dashboard/WorkflowTracker';
import CountdownTimer from '@/components/dashboard/CountdownTimer';
import NewProjectWizard from '@/components/projects/NewProjectWizard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ResearchProject } from '@/types';
import { STAGE_LABELS, STATUS_COLORS, PROJECT_TYPE_LABELS } from '@/lib/constants';
import { Plus, FolderOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function StudentProjectsPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  async function loadProjects() {
    if (!profile) return;
    const { data } = await supabase
      .from('research_projects')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) setProjects(data as ResearchProject[]);
    setLoading(false);
  }

  useEffect(() => { loadProjects(); }, [profile]);

  return (
    <DashboardShell
      basePath="/dashboard/student"
      demoRole="student"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/student' },
        { label: 'My Projects' },
      ]}
    >
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Research Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{loading ? '…' : `${projects.length} project(s) registered`}</p>
        </div>
        <Button size="sm" className="gap-2 h-9 bg-[#0B5ED7] hover:bg-[#0a52c4]" onClick={() => setWizardOpen(true)}>
          <Plus className="w-4 h-4" />
          Register New Project
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-16 text-center">
          <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No projects yet</h3>
          <p className="text-slate-400 text-sm mb-6">Register your first research project to begin your research journey.</p>
          <Button className="bg-[#0B5ED7] hover:bg-[#0a52c4]" onClick={() => setWizardOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Register Project
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map(project => (
            <div
              key={project.id}
              className={cn(
                'bg-white rounded-xl border shadow-sm overflow-hidden',
                project.project_status === 'expired' ? 'border-red-200' : 'border-slate-100'
              )}
            >
              {project.project_status === 'expired' && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-b border-red-100 text-xs text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  License expired — read-only access.
                  <Link href={`/dashboard/student/projects/${project.id}`} className="underline ml-1">Purchase an extension</Link>
                </div>
              )}
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={cn('text-xs border-0', STATUS_COLORS[project.status])}>
                        {project.status.replace(/_/g, ' ')}
                      </Badge>
                      {project.project_type && (
                        <Badge variant="outline" className="text-xs">{PROJECT_TYPE_LABELS[project.project_type]}</Badge>
                      )}
                      {project.program && (
                        <Badge variant="outline" className="text-xs">{project.program}</Badge>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-slate-800 mb-1.5 leading-snug">{project.title}</h2>
                    {project.abstract && (
                      <p className="text-sm text-slate-500 line-clamp-2">{project.abstract}</p>
                    )}
                  </div>
                  <Link href={`/dashboard/student/projects/${project.id}`}>
                    <Button size="sm" variant="outline" className="h-9 text-sm shrink-0">View details</Button>
                  </Link>
                </div>
              </div>
              {project.project_start_date && project.project_deadline && (
                <div className="px-6 py-4 border-b border-slate-50">
                  <CountdownTimer
                    projectStartDate={project.project_start_date}
                    projectDeadline={project.project_deadline}
                    progressPercentage={project.progress_percentage}
                    currentStage={project.current_stage}
                    projectStatus={project.project_status ?? 'active'}
                    compact
                  />
                </div>
              )}
              <div className="px-6 py-4">
                <p className="text-xs font-medium text-slate-500 mb-3">
                  Current Stage: <span className="text-slate-800">{STAGE_LABELS[project.current_stage]}</span>
                  <span className="mx-2 text-slate-200">|</span>
                  Progress: <span className="text-slate-800">{project.progress_percentage}%</span>
                </p>
                <WorkflowTracker currentStage={project.current_stage} status={project.status} compact />
              </div>
            </div>
          ))}
        </div>
      )}
      <NewProjectWizard open={wizardOpen} onOpenChange={v => { setWizardOpen(v); if (!v) loadProjects(); }} />
    </DashboardShell>
  );
}
