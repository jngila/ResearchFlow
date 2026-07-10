'use client';

import { useMemo } from 'react';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { buildGanttPhases } from '@/lib/ai-planner';
import { ProjectMilestone, MilestoneStatus } from '@/types';

interface AIProjectPlannerProps {
  milestones: ProjectMilestone[];
  durationMonths: number;
  startDate: string;
}

const STATUS_ICONS: Record<MilestoneStatus, React.ElementType> = {
  pending:     Circle,
  in_progress: Clock,
  completed:   CheckCircle2,
  overdue:     AlertTriangle,
  skipped:     Circle,
};

const STATUS_COLORS: Record<MilestoneStatus, string> = {
  pending:     'text-slate-400',
  in_progress: 'text-[#0B5ED7]',
  completed:   'text-[#198754]',
  overdue:     'text-red-500',
  skipped:     'text-slate-300',
};

export default function AIProjectPlanner({ milestones, durationMonths, startDate }: AIProjectPlannerProps) {
  const ganttPhases = useMemo(() => buildGanttPhases(durationMonths), [durationMonths]);
  const byMonth = useMemo(() => {
    const map: Record<number, ProjectMilestone[]> = {};
    milestones.forEach(m => {
      if (!map[m.month_number]) map[m.month_number] = [];
      map[m.month_number].push(m);
    });
    return map;
  }, [milestones]);

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progressPct = milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-slate-800">AI Research Roadmap</p>
            <p className="text-xs text-slate-500">{milestones.length} milestones across {durationMonths} months</p>
          </div>
        </div>
        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
          {progressPct}% complete
        </Badge>
      </div>

      {/* Gantt chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm overflow-x-auto">
        <p className="text-xs font-medium text-slate-600 mb-3">Research Phases — Gantt View</p>
        <div className="space-y-2 min-w-[400px]">
          {ganttPhases.map(phase => {
            const widthPct = ((phase.endMonth - phase.startMonth + 1) / durationMonths) * 100;
            const offsetPct = ((phase.startMonth - 1) / durationMonths) * 100;
            return (
              <div key={phase.phase} className="flex items-center gap-2">
                <div className="w-40 shrink-0">
                  <p className="text-xs text-slate-500 truncate">{phase.phase.replace(' & ', ' & ')}</p>
                </div>
                <div className="flex-1 relative h-6 bg-slate-50 rounded">
                  <div
                    className="absolute h-full rounded flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      left: `${offsetPct}%`,
                      width: `${Math.max(widthPct, 4)}%`,
                      backgroundColor: phase.color,
                    }}
                  >
                    {phase.endMonth - phase.startMonth + 1}m
                  </div>
                </div>
              </div>
            );
          })}
          {/* Month ruler */}
          <div className="flex items-center gap-2">
            <div className="w-40 shrink-0" />
            <div className="flex-1 flex justify-between px-0.5">
              {Array.from({ length: Math.min(durationMonths, 12) }, (_, i) => {
                const month = Math.ceil(((i + 0.5) / Math.min(durationMonths, 12)) * durationMonths);
                return (
                  <span key={i} className="text-xs text-slate-400">M{month}</span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly milestone list */}
      <div className="space-y-3">
        {Array.from({ length: durationMonths }, (_, i) => i + 1).map(month => {
          const monthMilestones = byMonth[month] ?? [];
          if (monthMilestones.length === 0) return null;
          const phase = monthMilestones[0].phase;
          return (
            <div key={month} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="w-8 h-8 bg-[#0B5ED7] text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                  M{month}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Month {month}</p>
                  <p className="text-xs text-slate-400">{phase}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {monthMilestones.map(milestone => {
                  const Icon = STATUS_ICONS[milestone.status];
                  return (
                    <div key={milestone.id} className="flex items-center gap-3 px-4 py-3">
                      <Icon className={cn('w-4 h-4 shrink-0', STATUS_COLORS[milestone.status])} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm',
                          milestone.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'
                        )}>
                          {milestone.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Due: {milestone.due_date}</p>
                      </div>
                      <Badge className={cn(
                        'text-xs border-0 capitalize shrink-0',
                        milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                        milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        milestone.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-500'
                      )}>
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
