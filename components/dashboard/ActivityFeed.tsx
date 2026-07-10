import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { GitBranch, Upload, CheckCircle, Clock, MessageSquare, Calendar } from 'lucide-react';

interface Activity {
  id: string;
  user: string;
  action: string;
  project: string;
  time: string;
  type: string;
}

const ACTIVITY_ICONS = {
  submission: Upload,
  approval: CheckCircle,
  upload: Upload,
  schedule: Calendar,
  review: MessageSquare,
  default: GitBranch,
};

const ACTIVITY_COLORS = {
  submission: 'bg-blue-50 text-blue-600',
  approval: 'bg-green-50 text-green-600',
  upload: 'bg-purple-50 text-purple-600',
  schedule: 'bg-amber-50 text-amber-600',
  review: 'bg-teal-50 text-teal-600',
  default: 'bg-slate-100 text-slate-500',
};

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
}

export default function ActivityFeed({ activities, maxItems = 5, className }: ActivityFeedProps) {
  const items = activities.slice(0, maxItems);

  return (
    <div className={cn('space-y-0 divide-y divide-slate-50', className)}>
      {items.map((activity, i) => {
        const type = activity.type as keyof typeof ACTIVITY_ICONS;
        const Icon = ACTIVITY_ICONS[type] ?? ACTIVITY_ICONS.default;
        const color = ACTIVITY_COLORS[type] ?? ACTIVITY_COLORS.default;

        return (
          <div key={activity.id} className="flex gap-3.5 py-3.5">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700">
                <span className="font-medium">{activity.user}</span>
                {' '}{activity.action}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{activity.project}</p>
            </div>
            <span className="text-xs text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">{activity.time}</span>
          </div>
        );
      })}

      {activities.length === 0 && (
        <div className="py-8 text-center">
          <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No recent activity</p>
        </div>
      )}
    </div>
  );
}
