import { cn } from '@/lib/utils';
import { STAGE_LABELS, STAGE_ORDER, STATUS_COLORS } from '@/lib/constants';
import { ProjectStage, ProjectStatus } from '@/types';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface WorkflowTrackerProps {
  currentStage: ProjectStage;
  status: ProjectStatus;
  compact?: boolean;
}

export default function WorkflowTracker({ currentStage, status, compact }: WorkflowTrackerProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {STAGE_ORDER.slice(0, -1).map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={stage} className="flex items-center gap-1.5 shrink-0">
              <div className={cn(
                'w-2 h-2 rounded-full',
                done ? 'bg-[#198754]' : active ? 'bg-[#0B5ED7]' : 'bg-slate-200'
              )} />
              {i < STAGE_ORDER.length - 2 && (
                <div className={cn('w-6 h-0.5', done ? 'bg-[#198754]' : 'bg-slate-100')} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {STAGE_ORDER.slice(0, -1).map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const upcoming = i > currentIndex;

        return (
          <div key={stage} className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
              {done ? (
                <CheckCircle className="w-5 h-5 text-[#198754]" />
              ) : active ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#0B5ED7] bg-[#0B5ED7]/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#0B5ED7]" />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-slate-200" />
              )}
              {i < STAGE_ORDER.length - 2 && (
                <div className={cn(
                  'absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-5',
                  done ? 'bg-[#198754]' : 'bg-slate-100'
                )} />
              )}
            </div>
            <div className={cn(
              'flex-1 flex items-center justify-between py-1 text-sm',
              upcoming ? 'opacity-40' : ''
            )}>
              <span className={cn(
                'font-medium',
                done ? 'text-slate-500 line-through' :
                active ? 'text-slate-800' :
                'text-slate-400'
              )}>
                {STAGE_LABELS[stage]}
              </span>
              {active && (
                <span className="text-xs bg-[#0B5ED7]/10 text-[#0B5ED7] px-2 py-0.5 rounded-full font-medium">
                  Current
                </span>
              )}
              {done && (
                <span className="text-xs text-[#198754]">Done</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
