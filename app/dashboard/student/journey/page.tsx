'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ResearchProject } from '@/types';
import { STAGE_LABELS, STAGE_ORDER } from '@/lib/constants';
import { CheckCircle, Circle, Clock, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const STAGE_DESCRIPTIONS: Record<string, string> = {
  concept_paper: 'Submit a brief research concept for initial coordinator approval.',
  proposal_development: 'Develop your full research proposal with supervisor guidance.',
  proposal_defense: 'Present and defend your proposal before the examination panel.',
  data_collection: 'Conduct your field research and collect data.',
  report_development: 'Write up your findings with supervisor review.',
  final_defense: 'Defend your completed research before the final panel.',
  corrections: 'Implement examiner corrections and get final approval.',
  peer_review: 'Submit for institutional peer review process.',
  publication: 'Prepare and submit for journal or conference publication.',
  repository: 'Deposit final work to the institutional repository.',
  completed: 'Your research journey is complete. Congratulations!',
};

export default function ResearchJourneyPage() {
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

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="Research Journey"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Research Journey' }]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : !project ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">No active research project found.</p>
            <Link href="/dashboard/student/projects">
              <Badge className="cursor-pointer bg-[#0B5ED7] text-white hover:bg-[#0a52c4]">Start a project</Badge>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Active Project</p>
              <h2 className="text-lg font-bold text-slate-800">{project.title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Current stage: <span className="font-medium text-[#0B5ED7]">{STAGE_LABELS[project.current_stage]}</span>
              </p>
            </div>

            <div className="space-y-3">
              {STAGE_ORDER.map((stage, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isLocked = index > currentIndex;
                return (
                  <div
                    key={stage}
                    className={cn(
                      'flex items-start gap-4 p-5 rounded-2xl border transition-all',
                      isCurrent ? 'bg-[#0B5ED7]/5 border-[#0B5ED7]/20 shadow-sm' :
                      isCompleted ? 'bg-green-50/50 border-green-100' :
                      'bg-white border-slate-100 opacity-60'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      isCompleted ? 'bg-[#198754] text-white' :
                      isCurrent ? 'bg-[#0B5ED7] text-white' :
                      'bg-slate-100 text-slate-400'
                    )}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                       isCurrent ? <Clock className="w-4 h-4" /> :
                       <Lock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn(
                          'font-semibold text-sm',
                          isCurrent ? 'text-[#0B5ED7]' : isCompleted ? 'text-[#198754]' : 'text-slate-500'
                        )}>
                          {String(index + 1).padStart(2, '0')}. {STAGE_LABELS[stage]}
                        </p>
                        {isCurrent && <Badge className="text-xs bg-[#0B5ED7]/10 text-[#0B5ED7] border-0">In progress</Badge>}
                        {isCompleted && <Badge className="text-xs bg-green-100 text-green-700 border-0">Completed</Badge>}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{STAGE_DESCRIPTIONS[stage]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
