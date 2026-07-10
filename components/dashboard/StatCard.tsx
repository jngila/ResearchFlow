import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
  className?: string;
}

const COLOR_MAP = {
  blue:   { icon: 'bg-blue-50 text-[#0B5ED7]',   border: 'border-blue-50' },
  green:  { icon: 'bg-green-50 text-[#198754]',  border: 'border-green-50' },
  amber:  { icon: 'bg-amber-50 text-amber-600',  border: 'border-amber-50' },
  red:    { icon: 'bg-red-50 text-red-500',       border: 'border-red-50' },
  purple: { icon: 'bg-purple-50 text-purple-600', border: 'border-purple-50' },
  slate:  { icon: 'bg-slate-100 text-slate-600',  border: 'border-slate-100' },
};

const DELTA_COLORS = {
  positive: 'text-[#198754]',
  negative: 'text-red-500',
  neutral:  'text-slate-400',
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaType = 'neutral',
  color = 'blue',
  className,
}: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', colors.icon)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {delta && (
          <span className={cn('text-xs font-medium mb-1', DELTA_COLORS[deltaType])}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
