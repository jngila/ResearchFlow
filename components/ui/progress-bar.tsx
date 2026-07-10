import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  max?: number;
}

export function ProgressBar({ value, className, max = 100 }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-[#0B5ED7] rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
