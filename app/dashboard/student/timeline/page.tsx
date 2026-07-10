'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ResearchProject } from '@/types';
import { STAGE_LABELS, STAGE_ORDER } from '@/lib/constants';
import { CalendarDays, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addMonths, parseISO } from 'date-fns';

function getMonthsBetween(start: Date, end: Date): number {
  return Math.max(0,
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}

export default function TimelinePage() {
  const { profile } = useAuth();
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('research_projects')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProject(data as ResearchProject);
        setLoading(false);
      });
  }, [profile]);

  const currentIndex = project ? STAGE_ORDER.indexOf(project.current_stage) : -1;
  const startDate = project?.start_date ? parseISO(project.start_date) : new Date();
  const endDate = project?.project_deadline ? parseISO(project.project_deadline) : addMonths(startDate, 6);
  const totalMonths = getMonthsBetween(startDate, endDate) || 6;
  const stageCount = STAGE_ORDER.length;
  const monthsPerStage = Math.max(1, Math.round(totalMonths / stageCount));

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="Project Timeline"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Timeline' }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : !project ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No active project to display timeline for.</p>
          </div>
        ) : (
          <>
            {/* Project header */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-1">{project.title}</h2>
                  <p className="text-sm text-slate-500">
                    {format(startDate, 'MMM d, yyyy')} — {format(endDate, 'MMM d, yyyy')}
                    <span className="mx-2 text-slate-300">·</span>
                    {totalMonths} months total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {differenceInDays(endDate, new Date()) < 0 ? (
                    <Badge className="bg-red-100 text-red-700 border-0">Overdue</Badge>
                  ) : differenceInDays(endDate, new Date()) <= 30 ? (
                    <Badge className="bg-amber-100 text-amber-700 border-0">Due soon</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 border-0">On track</Badge>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Progress</span>
                  <span>{currentIndex + 1} / {STAGE_ORDER.length} stages</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0B5ED7] rounded-full transition-all"
                    style={{ width: `${Math.round(((currentIndex + 1) / STAGE_ORDER.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Stage Timeline</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {STAGE_ORDER.map((stage, index) => {
                  const stageStart = addMonths(startDate, index * monthsPerStage);
                  const stageEnd = addMonths(startDate, (index + 1) * monthsPerStage);
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const daysLeft = differenceInDays(stageEnd, new Date());

                  return (
                    <div key={stage} className={cn(
                      'flex items-center gap-4 px-6 py-4',
                      isCurrent && 'bg-[#0B5ED7]/5'
                    )}>
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                        isCompleted ? 'bg-[#198754] text-white' :
                        isCurrent ? 'bg-[#0B5ED7] text-white' :
                        'bg-slate-100 text-slate-400'
                      )}>
                        {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-medium text-sm',
                          isCurrent ? 'text-[#0B5ED7]' : isCompleted ? 'text-[#198754]' : 'text-slate-500'
                        )}>
                          {STAGE_LABELS[stage]}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {format(stageStart, 'MMM d')} – {format(stageEnd, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {isCurrent && daysLeft > 0 && (
                          <p className="text-xs text-[#0B5ED7] font-medium">{daysLeft}d left</p>
                        )}
                        {isCurrent && daysLeft <= 0 && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </p>
                        )}
                        {isCompleted && (
                          <p className="text-xs text-[#198754] font-medium">Done</p>
                        )}
                        {!isCurrent && !isCompleted && (
                          <p className="text-xs text-slate-300">Pending</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
