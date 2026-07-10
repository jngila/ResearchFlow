'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import WorkflowTracker from '@/components/dashboard/WorkflowTracker';
import CountdownTimer from '@/components/dashboard/CountdownTimer';
import AIProjectPlanner from '@/components/projects/AIProjectPlanner';
import ExpiredProjectBanner from '@/components/projects/ExpiredProjectBanner';
import { supabase } from '@/lib/supabase';
import { ResearchProject } from '@/types';
import { STATUS_COLORS, STAGE_LABELS, PROJECT_TYPE_LABELS } from '@/lib/constants';
import { generateProjectMilestones } from '@/lib/ai-planner';
import { formatDeadlineDate } from '@/lib/project-utils';
import { Calendar, User, Upload, Download, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function StudentProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [supervisorName, setSupervisorName] = useState<string>('—');
  const [documents, setDocuments] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: proj } = await supabase
        .from('research_projects')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (!proj) { setLoading(false); return; }
      setProject(proj as ResearchProject);

      await Promise.all([
        proj.supervisor_id
          ? supabase.from('profiles').select('full_name').eq('id', proj.supervisor_id).maybeSingle().then(r => {
              if (r.data) setSupervisorName(r.data.full_name);
            })
          : Promise.resolve(),
        supabase.from('documents').select('*').eq('project_id', params.id).order('created_at', { ascending: false }).then(r => {
          if (r.data) setDocuments(r.data);
        }),
        supabase.from('comments').select('*, author:profiles(full_name, role)').eq('project_id', params.id).order('created_at').then(r => {
          if (r.data) setComments(r.data);
        }),
      ]);
      setLoading(false);
    }
    load();
  }, [params.id]);

  const milestones = useMemo(() => {
    if (!project?.project_start_date || !project?.selected_duration_months) return [];
    return generateProjectMilestones({
      projectId: project.id,
      projectType: project.project_type,
      startDate: project.project_start_date,
      durationMonths: project.selected_duration_months,
    });
  }, [project?.id, project?.project_type, project?.project_start_date, project?.selected_duration_months]);

  const milestonesWithIds = useMemo(() =>
    milestones.map((m, i) => ({ ...m, id: `m-${i}`, created_at: '', updated_at: '' })),
    [milestones]
  );

  if (loading) {
    return (
      <DashboardShell basePath="/dashboard/student" demoRole="student" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'My Projects', href: '/dashboard/student/projects' }, { label: '…' }]}>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </DashboardShell>
    );
  }

  if (!project) {
    return (
      <DashboardShell basePath="/dashboard/student" demoRole="student" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'My Projects', href: '/dashboard/student/projects' }, { label: 'Not found' }]}>
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400">Project not found.</div>
      </DashboardShell>
    );
  }

  const isExpired = project.project_status === 'expired';

  return (
    <DashboardShell
      basePath="/dashboard/student"
      demoRole="student"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/student' },
        { label: 'My Projects', href: '/dashboard/student/projects' },
        { label: project.title.slice(0, 30) + (project.title.length > 30 ? '…' : '') },
      ]}
    >
      {isExpired && (
        <ExpiredProjectBanner
          projectTitle={project.title}
          extensionCount={project.extension_count ?? 0}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={cn('text-xs border-0', STATUS_COLORS[project.status])}>
                {project.status.replace(/_/g, ' ')}
              </Badge>
              {project.project_type && (
                <Badge variant="outline" className="text-xs">{PROJECT_TYPE_LABELS[project.project_type]}</Badge>
              )}
              {project.program && <Badge variant="outline" className="text-xs">{project.program}</Badge>}
              {project.field_of_study && <Badge variant="outline" className="text-xs">{project.field_of_study}</Badge>}
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2">{project.title}</h1>
            {project.abstract && (
              <p className="text-sm text-slate-500 leading-relaxed">{project.abstract}</p>
            )}
          </div>
          {isExpired ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 shrink-0">
              <Lock className="w-3.5 h-3.5" />
              Read-only mode
            </div>
          ) : (
            <Button size="sm" className="h-9 bg-[#0B5ED7] hover:bg-[#0a52c4] gap-2 text-sm shrink-0">
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
          <div>
            <p className="text-xs text-slate-400 mb-1">Current Stage</p>
            <p className="text-sm font-medium text-slate-700">{STAGE_LABELS[project.current_stage]}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Supervisor</p>
            <p className="text-sm font-medium text-slate-700">{supervisorName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Start Date</p>
            <p className="text-sm font-medium text-slate-700">
              {project.project_start_date ? formatDeadlineDate(project.project_start_date) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Deadline</p>
            <p className={cn('text-sm font-medium', isExpired ? 'text-red-600' : 'text-slate-700')}>
              {project.project_deadline ? formatDeadlineDate(project.project_deadline) : '—'}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-medium text-slate-600">Overall Progress</span>
            <span className="font-bold text-slate-800">{project.progress_percentage}%</span>
          </div>
          <ProgressBar value={project.progress_percentage} className="h-2" />
        </div>
      </div>

      {project.project_start_date && project.project_deadline && (
        <div className="mb-6">
          <CountdownTimer
            projectStartDate={project.project_start_date}
            projectDeadline={project.project_deadline}
            progressPercentage={project.progress_percentage}
            currentStage={project.current_stage}
            projectStatus={project.project_status ?? 'active'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="planner">
            <TabsList className="bg-slate-100 h-9 mb-4">
              <TabsTrigger value="planner" className="text-xs h-7 gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Planner
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs h-7">Documents</TabsTrigger>
              <TabsTrigger value="messages" className="text-xs h-7">
                {isExpired ? <span className="flex items-center gap-1"><Lock className="w-3 h-3" />Messages</span> : 'Messages'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planner">
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                {milestonesWithIds.length > 0 && project.selected_duration_months ? (
                  <AIProjectPlanner
                    milestones={milestonesWithIds}
                    durationMonths={project.selected_duration_months}
                    startDate={project.project_start_date!}
                  />
                ) : (
                  <div className="flex flex-col items-center py-10 text-center">
                    <Sparkles className="w-10 h-10 text-amber-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700 mb-1">No AI roadmap yet</p>
                    <p className="text-xs text-slate-400">AI milestones are generated when a project license is activated.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-slate-50">
                  <h3 className="text-sm font-semibold text-slate-800">My Documents</h3>
                  {isExpired ? (
                    <div className="flex items-center gap-1.5 text-xs text-red-500">
                      <Lock className="w-3.5 h-3.5" />Upload disabled
                    </div>
                  ) : (
                    <Button size="sm" className="h-8 text-xs bg-[#0B5ED7] hover:bg-[#0a52c4] gap-1.5">
                      <Upload className="w-3.5 h-3.5" />Upload
                    </Button>
                  )}
                </div>
                {documents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No documents uploaded yet.</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center gap-4 px-5 py-4">
                        <div className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600">
                          {doc.mime_type?.includes('pdf') ? 'PDF' : doc.type?.toUpperCase() ?? 'FILE'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                          <p className="text-xs text-slate-400">
                            {doc.file_size_bytes ? `${Math.round(doc.file_size_bytes / 1024)} KB` : ''} &bull; v{doc.version}
                          </p>
                        </div>
                        <Badge className={cn('text-xs border-0 shrink-0',
                          doc.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {doc.status}
                        </Badge>
                        <a href={doc.file_url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 shrink-0">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages">
              {isExpired ? (
                <div className="bg-white rounded-xl border border-red-100 p-10 shadow-sm flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Messaging disabled</p>
                  <p className="text-xs text-slate-400">Extend your project license to resume communication with your supervisor.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">No messages yet. Start the conversation.</p>
                  ) : comments.map((c: any) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B5ED7]/10 flex items-center justify-center text-[#0B5ED7] text-xs font-bold shrink-0">
                        {(c.author?.full_name ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">{c.author?.full_name ?? 'Unknown'}</p>
                        <div className="p-3 rounded-xl text-sm bg-slate-100 text-slate-700">{c.content}</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-4 flex gap-2">
                    <input
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0B5ED7]/20"
                      placeholder="Type a message..."
                    />
                    <Button size="sm" className="h-9 bg-[#0B5ED7] hover:bg-[#0a52c4]">Send</Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Research Journey</h3>
            <WorkflowTracker currentStage={project.current_stage} status={project.status} />
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Project Info</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Supervisor: <span className="text-slate-700 font-medium">{supervisorName}</span></span>
              </div>
              {project.selected_duration_months && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Duration: <span className="text-slate-700 font-medium">{project.selected_duration_months} months</span></span>
                </div>
              )}
              {project.extension_count != null && project.extension_count > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{project.extension_count} extension(s) used</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
