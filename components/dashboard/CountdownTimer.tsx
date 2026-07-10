'use client';

import { useMemo } from 'react';
import { Clock, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  calcDaysRemaining, calcCompletionPercentage, calcDeadlineStatus, formatDeadlineDate,
} from '@/lib/project-utils';
import {
  DEADLINE_STATUS_LABELS, DEADLINE_STATUS_COLORS,
  STAGE_LABELS,
} from '@/lib/constants';
import { ProjectStage, DeadlineStatus, ProjectLifecycleStatus } from '@/types';

interface CountdownTimerProps {
  projectStartDate: string;
  projectDeadline: string;
  progressPercentage: number;
  currentStage: ProjectStage;
  projectStatus: ProjectLifecycleStatus;
  compact?: boolean;
}

const STATUS_ICONS: Record<DeadlineStatus, React.ElementType> = {
  ahead_of_schedule: TrendingUp,
  on_track: CheckCircle2,
  behind_schedule: TrendingDown,
  overdue: AlertTriangle,
};

export default function CountdownTimer({
  projectStartDate,
  projectDeadline,
  progressPercentage,
  currentStage,
  projectStatus,
  compact = false,
}: CountdownTimerProps) {
  const { daysRemaining, timeUsedPct, deadlineStatus } = useMemo(() => {
    const days = calcDaysRemaining(projectDeadline);
    const timeUsed = calcCompletionPercentage(projectStartDate, projectDeadline);
    const status = calcDeadlineStatus(days, progressPercentage, timeUsed);
    return { daysRemaining: days, timeUsedPct: timeUsed, deadlineStatus: status };
  }, [projectStartDate, projectDeadline, progressPercentage]);

  const StatusIcon = STATUS_ICONS[deadlineStatus];
  const isExpired = projectStatus === 'expired' || daysRemaining < 0;

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 rounded-xl border',
        isExpired ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'
      )}>
        <Clock className={cn('w-4 h-4 shrink-0', isExpired ? 'text-red-500' : 'text-[#0B5ED7]')} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-slate-500">Deadline: {formatDeadlineDate(projectDeadline)}</span>
            <Badge className={cn('text-xs border-0', DEADLINE_STATUS_COLORS[deadlineStatus])}>
              {isExpired ? 'Expired' : `${Math.abs(daysRemaining)}d ${daysRemaining >= 0 ? 'left' : 'overdue'}`}
            </Badge>
          </div>
          <ProgressBar value={progressPercentage} className="h-1.5" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-2xl border p-6',
      isExpired
        ? 'bg-red-50 border-red-200'
        : 'bg-gradient-to-br from-[#0B5ED7]/5 to-blue-50 border-blue-100'
    )}>
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B5ED7]" />
            Project Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {STAGE_LABELS[currentStage]} &bull; {progressPercentage}% complete
          </p>
        </div>
        <Badge className={cn('text-xs border-0 gap-1', DEADLINE_STATUS_COLORS[deadlineStatus])}>
          <StatusIcon className="w-3 h-3" />
          {isExpired ? 'Expired' : DEADLINE_STATUS_LABELS[deadlineStatus]}
        </Badge>
      </div>

      {/* Big countdown */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className={cn(
          'rounded-xl p-4 text-center',
          isExpired ? 'bg-red-100' : 'bg-white'
        )}>
          <p className={cn(
            'text-3xl font-bold leading-none mb-1',
            isExpired ? 'text-red-600' : 'text-[#0B5ED7]'
          )}>
            {isExpired ? Math.abs(daysRemaining) : daysRemaining}
          </p>
          <p className="text-xs text-slate-500">{isExpired ? 'Days overdue' : 'Days remaining'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-slate-800 leading-none mb-1">{progressPercentage}%</p>
          <p className="text-xs text-slate-500">Work done</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-slate-800 leading-none mb-1">{timeUsedPct}%</p>
          <p className="text-xs text-slate-500">Time used</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Research progress</span>
            <span className="font-medium text-slate-700">{progressPercentage}%</span>
          </div>
          <ProgressBar value={progressPercentage} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Time elapsed</span>
            <span className="font-medium text-slate-700">{timeUsedPct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isExpired ? 'bg-red-400' : timeUsedPct > progressPercentage + 20 ? 'bg-amber-400' : 'bg-emerald-400'
              )}
              style={{ width: `${timeUsedPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-blue-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Started: <strong className="text-slate-700">{formatDeadlineDate(projectStartDate)}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Deadline: <strong className={cn(isExpired ? 'text-red-600' : 'text-slate-700')}>{formatDeadlineDate(projectDeadline)}</strong></span>
        </div>
      </div>
    </div>
  );
}
